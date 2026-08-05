"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { ScanBarcode } from "lucide-react";

type ProductBarcodeProps = {
  value: string | null;
  height?: number;
  width?: number;
  className?: string;
};

function pickFormat(value: string): "EAN13" | "CODE128" {
  return /^\d{12,13}$/.test(value) ? "EAN13" : "CODE128";
}

export function ProductBarcode({ value, height = 90, width = 300, className }: ProductBarcodeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) {
      return;
    }

    try {
      JsBarcode(canvas, value, {
        format: pickFormat(value),
        width: 2,
        height,
        displayValue: true,
        fontSize: 13,
        font: "ui-monospace, SFMono-Regular, Menlo, monospace",
        margin: 8,
        lineColor: "#0f172a",
        background: "#ffffff",
      });
    } catch {
      try {
        JsBarcode(canvas, value, {
          format: "CODE128",
          width: 2,
          height,
          displayValue: true,
          fontSize: 13,
          margin: 8,
          lineColor: "#0f172a",
          background: "#ffffff",
        });
      } catch {
        // Unrenderable barcode — show the empty state below.
      }
    }
  }, [value, height]);

  if (!value) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 border border-dashed border-border bg-muted/30 py-8 text-center ${className ?? ""}`}>
        <ScanBarcode className="h-6 w-6 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No barcode assigned</p>
      </div>
    );
  }

  return (
    <div className={`flex justify-center overflow-hidden rounded-[1rem] border border-border bg-white p-2 ${className ?? ""}`}>
      <canvas ref={canvasRef} width={width} height={height + 32} style={{ width: "100%", maxWidth: width, height: "auto" }} />
    </div>
  );
}
