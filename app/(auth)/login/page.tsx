import { LoginClientPage } from "@/components/auth/login-client-page";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const resolved = await searchParams;
  return <LoginClientPage nextRoute={resolved?.next ?? null} />;
}
