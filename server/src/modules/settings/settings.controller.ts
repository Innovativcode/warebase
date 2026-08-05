import type { Response } from "express";
import { asyncHandler } from "@/utils/http";
import { getAppSettings, updateAppSettings } from "./settings.service";

export const getSettings = asyncHandler(async (_req, res: Response) => {
  const settings = await getAppSettings();
  res.json({ success: true, data: settings });
});

export const patchSettings = asyncHandler(async (req, res: Response) => {
  const settings = await updateAppSettings(req.body);
  res.json({ success: true, data: settings });
});
