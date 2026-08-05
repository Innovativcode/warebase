"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { WarebaseLoader } from "@/components/loader/warebase-loader";

export default function DashboardResolverPage() {
  const router = useRouter();
  const { data, loading } = useCurrentUser();

  useEffect(() => {
    if (loading) return;

    const publicIdentifier = data?.data?.publicIdentifier;

    if (publicIdentifier) {
      router.replace(`/${publicIdentifier}/dashboard`);
    } else {
      router.replace("/login");
    }
  }, [loading, data, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <WarebaseLoader variant="compact" />
    </div>
  );
}
