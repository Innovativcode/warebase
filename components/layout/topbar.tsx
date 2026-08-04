"use client";

import { useState } from "react";
import { CircleHelp, LogOut, Search, Plus, User2, Settings2, Keyboard, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GlobalCommandMenu } from "@/components/layout/global-command-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { apiFetch } from "@/lib/api";
import { NotificationCenter } from "@/components/layout/notification-center";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TopbarProps = {
  title: string;
  description?: string;
};

export function Topbar({ title, description }: TopbarProps) {
  const router = useRouter();
  const { data } = useCurrentUser();
  const [commandOpen, setCommandOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      toast.success("Signed out");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out");
    }
    setLogoutOpen(false);
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <GlobalCommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
      <header className="sticky top-0 z-30 border-b border-border/70 bg-card">
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <MobileNav />

          <div className="min-w-0 flex-1">
            <h1 className="text-[1.28rem] font-semibold tracking-tight text-foreground sm:text-[1.35rem]">{title}</h1>
            {description ? <p className="mt-1 max-w-3xl text-sm leading-5 text-muted-foreground">{description}</p> : null}
          </div>

          <div className="hidden items-center gap-2 xl:flex">
            <Button
              variant="outline"
              onClick={() => setCommandOpen(true)}
              className="min-w-[380px] justify-start border-border/70 bg-background/95 px-4 text-left font-normal text-muted-foreground/90 shadow-sm"
            >
              <Search className="h-[18px] w-[18px] stroke-[1.8] text-muted-foreground/65" />
              <span className="font-normal tracking-normal text-muted-foreground/90">Search</span>
              <span className="rounded-md border border-border/70 bg-background px-1.5 py-0.5 text-[0.6rem] font-medium tracking-normal text-muted-foreground">
                {typeof navigator !== "undefined" && navigator.platform.includes("Mac") ? "⌘K" : "Ctrl K"}
              </span>
            </Button>
            <Button variant="outline" className="border-border/70 bg-background/95 px-3.5 text-muted-foreground/90 shadow-sm">
              <Plus className="h-[18px] w-[18px] stroke-[1.8] text-muted-foreground/65" />
              Create
            </Button>
            <NotificationCenter />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Help" className="h-12 w-12 border-border/70 bg-background/95 text-muted-foreground/90 shadow-sm">
                  <CircleHelp className="h-[20px] w-[20px] stroke-[1.8] text-muted-foreground/65" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>Help</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setCommandOpen(true)}>
                  <Keyboard className="mr-2 h-4 w-4" />
                  Keyboard shortcuts
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => window.location.assign("/settings")}>
                  <Settings2 className="mr-2 h-4 w-4" />
                  Open settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => window.location.assign("mailto:support@inventory.local")}>
                  <Mail className="mr-2 h-4 w-4" />
                  Contact support
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-border/70 bg-background/95 px-3.5 text-muted-foreground/90 shadow-sm">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[0.8rem] border border-border/70 bg-background text-foreground/80">
                    <User2 className="h-[22px] w-[22px] stroke-[2]" />
                  </span>
                  <span className="text-left leading-tight">
                    <span className="block text-sm font-medium text-foreground">{data?.data?.name ?? "User"}</span>
                    <span className="block text-[0.7rem] text-muted-foreground">{data?.data?.role ?? "Member"}</span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push("/settings")}>
                  <Settings2 className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setLogoutOpen(true)}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Separator />
      </header>
      <ConfirmDialog
        open={logoutOpen}
        title="Sign out"
        description="You will need to sign in again to continue."
        confirmLabel="Sign out"
        confirmVariant="destructive"
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogout}
      />
    </>
  );
}
