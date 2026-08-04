"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AlertTriangle, Camera, CameraOff, CheckCircle2, Copy, Loader2, Package, RefreshCw, ScanBarcode, Search, Warehouse } from "lucide-react";
import { BinaryBitmap, HybridBinarizer, MultiFormatReader, RGBLuminanceSource } from "@zxing/library";
import { toast } from "sonner";
import { apiFetch, ApiClientError, restockProduct } from "@/lib/api";
import type { ApiResult } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type BarcodeInventoryItem = {
  quantityOnHand: number;
  reservedQty: number;
  availableQty: number;
  warehouse: {
    id: string;
    name: string;
    code: string;
  };
};

type BarcodeLookupRecord = {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  unit: string;
  reorderPoint: number;
  reorderQty: number;
  isActive: boolean;
  category: { id: string; name: string } | null;
  supplier: { id: string; name: string } | null;
  quantityOnHand: number;
  reservedQty: number;
  availableQty: number;
  inventoryItems: BarcodeInventoryItem[];
};

type ScannerState = "idle" | "starting" | "scanning" | "manual" | "permission-denied" | "unsupported";

type BarcodeDetectorLike = {
  detect(source: CanvasImageSource): Promise<Array<{ rawValue?: string }>>;
};

type BarcodeDetectorConstructorLike = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

const numberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

const frameReader = new MultiFormatReader();

function decodeFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement | null): string | undefined {
  if (!canvas) {
    return undefined;
  }

  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) {
    return undefined;
  }

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return undefined;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(video, 0, 0, width, height);

  const data = ctx.getImageData(0, 0, width, height).data;
  const luminance = new Uint8ClampedArray(width * height);
  for (let i = 0; i < width * height; i++) {
    luminance[i] = (data[i * 4] * 30 + data[i * 4 + 1] * 59 + data[i * 4 + 2] * 11) / 100;
  }

  const bitmap = new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(luminance, width, height)));
  try {
    return frameReader.decode(bitmap).getText();
  } catch {
    return undefined;
  }
}

export function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const intervalRef = useRef<number | null>(null);
  const lastLookupRef = useRef<string | null>(null);
  const lastLookupAtRef = useRef<number>(0);

  const [cameraState, setCameraState] = useState<ScannerState>("idle");
  const [barcode, setBarcode] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [restocking, setRestocking] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [record, setRecord] = useState<BarcodeLookupRecord | null>(null);
  const [recentScans, setRecentScans] = useState<BarcodeLookupRecord[]>([]);
  const [lastScannedAt, setLastScannedAt] = useState<string | null>(null);
  const [browserSupportsDetector, setBrowserSupportsDetector] = useState(true);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraState("idle");
  }, []);

  const lookupBarcode = useCallback(async (rawBarcode: string, source: "camera" | "manual") => {
    const normalized = rawBarcode.trim();
    if (!normalized) {
      return;
    }

    const now = Date.now();
    if (lastLookupRef.current === normalized && now - lastLookupAtRef.current < 2500) {
      return;
    }

    lastLookupRef.current = normalized;
    lastLookupAtRef.current = now;
    setBarcode(normalized);
    setLookupLoading(true);
    setLookupError(null);

    try {
      const response = await apiFetch<ApiResult<BarcodeLookupRecord>>(`/products/barcode/${encodeURIComponent(normalized)}`);
      setRecord(response.data);
      setLastScannedAt(new Date().toLocaleString());
      setRecentScans((current) => {
        const filtered = current.filter((item) => item.id !== response.data.id);
        return [response.data, ...filtered].slice(0, 5);
      });
    } catch (error) {
      setRecord(null);
      if (error instanceof ApiClientError && error.status === 404) {
        const message = `No product with barcode ${normalized} was found in the catalog. Add it to a product first, or double-check the digits.`;
        setLookupError(message);
        toast.warning("Product barcode not found");
      } else {
        const message = error instanceof ApiClientError ? error.message : "Unable to load the scanned product";
        setLookupError(message);
        toast.error(message);
      }
    } finally {
      setLookupLoading(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    setLookupError(null);
    setLookupLoading(false);
    stopCamera();

    if (typeof window === "undefined") {
      return;
    }

    const detectorCtor = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructorLike }).BarcodeDetector;
    if (!detectorCtor) {
      setBrowserSupportsDetector(false);
    }

    try {
      setCameraState("starting");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      if (detectorCtor) {
        detectorRef.current = new detectorCtor({
          formats: ["code_128", "ean_13", "ean_8", "upc_a", "upc_e", "qr_code"],
        });
      }

      intervalRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
          return;
        }

        let rawValue: string | undefined;

        if (detectorRef.current) {
          try {
            const detections = await detectorRef.current.detect(videoRef.current);
            rawValue = detections.find((item) => item.rawValue)?.rawValue;
          } catch {
            rawValue = undefined;
          }
        } else {
          rawValue = decodeFrame(videoRef.current, canvasRef.current);
        }

        if (rawValue) {
          await lookupBarcode(rawValue, "camera");
        }
      }, 900);

      setCameraState("scanning");
    } catch (error) {
      setCameraState("permission-denied");
      setLookupError(error instanceof Error ? error.message : "Camera access is required to scan barcodes");
    }
  }, [lookupBarcode]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const detectorCtor = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructorLike }).BarcodeDetector;
    setBrowserSupportsDetector(Boolean(detectorCtor));
  }, []);

  const statusLabel = useMemo(() => {
    if (cameraState === "scanning") return "Live camera scanning";
    if (cameraState === "starting") return "Opening camera";
    if (cameraState === "permission-denied") return "Camera blocked";
    if (cameraState === "unsupported") return "Detector unavailable";
    return "Manual lookup ready";
  }, [cameraState]);

  const handleCopyBarcode = async () => {
    const value = record?.barcode ?? barcode;
    if (!value || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(value);
  };

  const handleManualSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await lookupBarcode(barcode, "manual");
  };

  const handleRestock = async (productId: string) => {
    setRestocking(true);
    try {
      const result = await restockProduct({ productId });
      toast.success(`Restock order ${result.data.orderNumber} created`);
      setLookupError(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create restock order");
    } finally {
      setRestocking(false);
    }
  };

  return (
    <AppShell title="Barcode scanner" description="Scan a barcode or enter it manually to resolve a product directly from the database.">
      <Card className="border-border/70">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit">
                <ScanBarcode className="mr-1.5 h-3.5 w-3.5" />
                Scan center
              </Badge>
              <CardTitle className="text-[1.35rem]">Barcode lookup</CardTitle>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Use a device camera or the scanner keyboard to resolve products from the live catalog. Every result comes from PostgreSQL-backed product data.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={cameraState === "scanning" ? "success" : cameraState === "permission-denied" ? "danger" : "secondary"} className="gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {statusLabel}
              </Badge>
              <Badge variant={browserSupportsDetector ? "info" : "warning"}>{browserSupportsDetector ? "Detector ready" : "Manual mode"}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[1rem] border border-border bg-background">
              <div className="relative aspect-[4/3] bg-slate-950">
                <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
                <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),rgba(15,23,42,0.28))]" />
                  <div className="absolute inset-x-1/2 top-1/2 h-[56%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-[1.35rem] border border-white/35 shadow-[0_0_0_9999px_rgba(15,23,42,0.34)]" />
                  <div className="absolute inset-x-1/2 top-1/2 h-[56%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-[1.35rem] border border-white/15" />
                </div>
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-white">
                  {cameraState === "scanning" ? <Camera className="h-3.5 w-3.5" /> : <ScanBarcode className="h-3.5 w-3.5" />}
                  {cameraState === "scanning" ? "Scanning..." : "Ready to scan"}
                </div>
                {lookupLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/80 px-4 py-2 text-sm text-white">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Resolving barcode
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1rem] border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Camera</p>
                <p className="mt-2 text-sm font-medium text-foreground">{cameraState === "scanning" ? "Live" : cameraState === "starting" ? "Starting" : "Idle"}</p>
              </div>
              <div className="rounded-[1rem] border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Detector</p>
                <p className="mt-2 text-sm font-medium text-foreground">{browserSupportsDetector ? "Native" : "Built-in decoder"}</p>
              </div>
              <div className="rounded-[1rem] border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Last scan</p>
                <p className="mt-2 text-sm font-medium text-foreground">{lastScannedAt ?? "None yet"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={startCamera} className="gap-2">
                <Camera className="h-4 w-4" />
                Start camera
              </Button>
              <Button variant="outline" onClick={stopCamera} className="gap-2">
                <CameraOff className="h-4 w-4" />
                Stop camera
              </Button>
              <Button variant="outline" onClick={() => void lookupBarcode(barcode, "manual")} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry lookup
              </Button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3 rounded-[1rem] border border-border bg-background p-4">
              <div className="space-y-2">
                <label htmlFor="barcode" className="text-sm font-medium text-foreground">
                  Manual barcode
                </label>
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    value={barcode}
                    onChange={(event) => setBarcode(event.target.value)}
                    placeholder="Scan or type a barcode"
                    className="font-mono text-sm tracking-normal"
                    autoComplete="off"
                    inputMode="numeric"
                  />
                  <Button type="submit" className="gap-2">
                    <Search className="h-4 w-4" />
                    Lookup
                  </Button>
                </div>
              </div>
              {lookupError ? (
                <div className="flex items-start gap-2 rounded-[0.95rem] border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                  <span>{lookupError}</span>
                </div>
              ) : null}
              {!browserSupportsDetector ? (
                <div className="flex items-start gap-2 rounded-[0.95rem] border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <span>Using the built-in decoder for EAN-13, Code-128, and QR — scanning works without the native Barcode Detector API.</span>
                </div>
              ) : null}
            </form>
          </div>

          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Resolved product</CardTitle>
              </CardHeader>
              <CardContent>
                {record ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-[0.9rem] border border-border bg-background text-foreground/80">
                        <Package className="h-5 w-5 stroke-[2.2]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-semibold text-foreground">{record.name}</p>
                        <p className="text-sm text-muted-foreground">{record.description ?? "No description provided."}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[0.95rem] border border-border bg-background p-3">
                        <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">SKU</p>
                        <p className="mt-1 font-mono text-sm text-foreground">{record.sku}</p>
                      </div>
                      <div className="rounded-[0.95rem] border border-border bg-background p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Barcode</p>
                          <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => void handleCopyBarcode()}>
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                          </Button>
                        </div>
                        <p className="mt-1 font-mono text-sm text-foreground">{record.barcode ?? barcode}</p>
                      </div>
                      <div className="rounded-[0.95rem] border border-border bg-background p-3">
                        <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Available</p>
                        <p className="mt-1 text-sm font-medium tabular-nums text-foreground">{numberFormatter.format(record.availableQty)}</p>
                      </div>
                      <div className="rounded-[0.95rem] border border-border bg-background p-3">
                        <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Reserved</p>
                        <p className="mt-1 text-sm font-medium tabular-nums text-foreground">{numberFormatter.format(record.reservedQty)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant={record.isActive ? "success" : "secondary"} className="gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {record.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {record.category ? <Badge variant="outline">{record.category.name}</Badge> : null}
                      {record.supplier ? <Badge variant="outline">{record.supplier.name}</Badge> : null}
                    </div>

                    <div className="flex items-center justify-between rounded-[0.95rem] border border-border bg-muted/25 p-3 text-sm text-muted-foreground">
                      <span>Unit</span>
                      <span className="font-medium text-foreground">{record.unit}</span>
                    </div>

                    <Button
                      onClick={() => void handleRestock(record.id)}
                      disabled={restocking}
                      className="w-full gap-2"
                    >
                      {restocking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      {restocking ? "Creating restock order..." : "Restock product"}
                    </Button>
                  </div>
                ) : (
                  <EmptyState
                    title="No product scanned yet"
                    description="Start the camera or type a barcode to resolve the product record."
                    icon={<ScanBarcode className="h-6 w-6" />}
                  />
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Warehouse breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {record?.inventoryItems?.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Warehouse</TableHead>
                        <TableHead className="text-right">On hand</TableHead>
                        <TableHead className="text-right">Available</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {record.inventoryItems.map((item) => (
                        <TableRow key={item.warehouse.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="flex h-8 w-8 items-center justify-center rounded-[0.75rem] border border-border bg-background text-muted-foreground/80">
                                <Warehouse className="h-4 w-4 stroke-[2]" />
                              </span>
                              <div>
                                <div className="font-medium text-foreground">{item.warehouse.name}</div>
                                <div className="text-xs text-muted-foreground">{item.warehouse.code}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{numberFormatter.format(item.quantityOnHand)}</TableCell>
                          <TableCell className="text-right tabular-nums">{numberFormatter.format(item.availableQty)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <EmptyState
                    title="No inventory yet"
                    description="This product exists in the catalog but has not been stocked into a warehouse."
                    icon={<Warehouse className="h-6 w-6" />}
                  />
                )}
              </CardContent>
            </Card>

            {recentScans.length > 0 ? (
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recent scans</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {recentScans.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 py-1.5">
                      <span className="w-5 shrink-0 text-center font-mono text-xs tabular-nums text-muted-foreground">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{item.barcode}</p>
                      </div>
                      <span className="text-sm font-medium tabular-nums text-muted-foreground">
                        {numberFormatter.format(item.availableQty)} available
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
