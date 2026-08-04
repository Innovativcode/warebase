import { prisma } from "@/db/prisma";

const EAN13_PREFIX = "290";

const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

export const computeEan13CheckDigit = (digits12: string): number => {
  let sum = 0;
  for (let index = 0; index < 12; index += 1) {
    const digit = Number(digits12[index]);
    const weight = index % 2 === 0 ? 1 : 3;
    sum += digit * weight;
  }
  return (10 - (sum % 10)) % 10;
};

export const generateUniqueBarcode = async (seedValue: string): Promise<string> => {
  let seed = hashString(seedValue);
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const base = `${EAN13_PREFIX}${String((seed + attempt) % 1000000000).padStart(9, "0")}`;
    const barcode = `${base}${computeEan13CheckDigit(base)}`;
    const existing = await prisma.product.findUnique({ where: { barcode } });
    if (!existing) {
      return barcode;
    }
  }
  throw new Error("Unable to allocate a unique barcode");
};

export const ensureAllProductsHaveBarcode = async (): Promise<number> => {
  const products = await prisma.product.findMany({
    where: { barcode: null },
    select: { id: true, sku: true },
  });

  let assigned = 0;

  for (const product of products) {
    const barcode = await generateUniqueBarcode(`${product.id}:${product.sku}`);
    await prisma.product.update({
      where: { id: product.id },
      data: { barcode },
    });
    assigned += 1;
  }

  return assigned;
};
