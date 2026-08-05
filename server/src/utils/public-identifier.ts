import { prisma } from "@/db/prisma";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const SUFFIX_LENGTH = 8;
const MAX_ATTEMPTS = 12;

const randomSuffix = (length: number): string =>
  Array.from({ length }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

export const generatePublicIdentifier = (name: string): string => {
  const base =
    name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || "staff";
  return `${base}-${randomSuffix(SUFFIX_LENGTH)}`;
};

export const createUniquePublicIdentifier = async (name: string): Promise<string> => {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = generatePublicIdentifier(name);
    const existing = await prisma.user.findUnique({
      where: { publicIdentifier: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }

  return `${"staff"}-${Date.now().toString(36)}${randomSuffix(4)}`;
};
