import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "@/config/env";
import { requestId } from "@/middleware/request-id";
import { errorHandler } from "@/middleware/error";
import { notFound } from "@/utils/http";
import { authRouter } from "@/modules/auth/auth.routes";
import { dashboardRouter } from "@/modules/dashboard/dashboard.routes";
import { productRouter } from "@/modules/products/product.routes";
import { warehouseRouter } from "@/modules/warehouses/warehouse.routes";
import { supplierRouter } from "@/modules/suppliers/supplier.routes";
import { projectRouter } from "@/modules/projects/project.routes";
import { purchaseOrderRouter } from "@/modules/purchase-orders/purchase-order.routes";
import { inventoryRouter } from "@/modules/inventory/inventory.routes";
import { usersRouter } from "@/modules/users/users.routes";
import { auditRouter } from "@/modules/audit/audit.routes";
import { notificationsRouter } from "@/modules/notifications/notifications.routes";
import { approvalsRouter } from "@/modules/approvals/approvals.routes";
import { permissionsRouter } from "@/modules/permissions/permissions.routes";
import { accountingRouter } from "@/modules/accounting/accounting.routes";
import { activitiesRouter } from "@/modules/activities/activity.routes";
import { settingsRouter } from "@/modules/settings/settings.routes";

export const createApp = () => {
  const app = express();

  app.disable("x-powered-by");
  app.use(requestId);
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (env.CORS_ORIGIN.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    }),
  );
  app.use(helmet());
  app.use(express.json({ limit: "6mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan("combined"));

  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok", service: "inventory-api" } });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/dashboard", dashboardRouter);
  app.use("/api/v1/products", productRouter);
  app.use("/api/v1/warehouses", warehouseRouter);
  app.use("/api/v1/suppliers", supplierRouter);
  app.use("/api/v1/projects", projectRouter);
  app.use("/api/v1/purchase-orders", purchaseOrderRouter);
  app.use("/api/v1/inventory", inventoryRouter);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/audit-logs", auditRouter);
  app.use("/api/v1/notifications", notificationsRouter);
  app.use("/api/v1/approvals", approvalsRouter);
  app.use("/api/v1/permissions", permissionsRouter);
  app.use("/api/v1/accounting", accountingRouter);
  app.use("/api/v1/activities", activitiesRouter);
  app.use("/api/v1/settings", settingsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
