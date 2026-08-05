import { prisma } from "@/db/prisma";
import { settingsPatchSchema } from "./settings.schemas";

export const getAppSettings = async () => {
  const settings = await prisma.appSetting.findUnique({
    where: { id: "singleton" },
  });

  return {
    currency: settings?.currency ?? null,
  };
};

export const updateAppSettings = async (input: unknown) => {
  const payload = settingsPatchSchema.parse(input);

  const settings = await prisma.appSetting.upsert({
    where: { id: "singleton" },
    update: { currency: payload.currency },
    create: { id: "singleton", currency: payload.currency },
  });

  return { currency: settings.currency ?? null };
};

export const getBusinessCurrency = async (): Promise<string | null> => {
  const settings = await prisma.appSetting.findUnique({
    where: { id: "singleton" },
  });
  return settings?.currency ?? null;
};
