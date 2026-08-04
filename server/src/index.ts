import http from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { initRealtime } from "./realtime";
import { ensureAllProductsHaveBarcode } from "./modules/products/barcode.service";
import { evaluateLowStock } from "./modules/inventory/low-stock.service";

const LOW_STOCK_SCAN_INTERVAL_MS = 5 * 60 * 1000;

const app = createApp();
const httpServer = http.createServer(app);

initRealtime(httpServer);

httpServer.listen(env.API_PORT, env.API_HOST, async () => {
  console.log(`Inventory API listening on http://${env.API_HOST}:${env.API_PORT}`);
  console.log(`Realtime endpoint: /api/socketio`);

  try {
    const assigned = await ensureAllProductsHaveBarcode();
    if (assigned > 0) {
      console.log(`Backfilled barcodes for ${assigned} products`);
    }
  } catch (error) {
    console.error("Failed to backfill product barcodes:", error);
  }

  try {
    const { total } = await evaluateLowStock();
    console.log(`Low stock scan complete: ${total} product(s) at or below reorder point`);
  } catch (error) {
    console.error("Initial low stock scan failed:", error);
  }

  setInterval(() => {
    void evaluateLowStock().catch((error) => {
      console.error("Scheduled low stock scan failed:", error);
    });
  }, LOW_STOCK_SCAN_INTERVAL_MS);
});
