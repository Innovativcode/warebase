import { Badge } from "@/components/ui/badge";
import { LottiePlayer } from "@/components/media/lottie-player";
import shoppingAnimation from "@/assets/lottie/shopping.json";
import { ShoppingBag } from "lucide-react";

export function LoginHero() {
  return (
    <section className="flex h-full flex-col justify-between rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[0_12px_28px_rgba(15,23,42,0.08)] xl:p-8">
      <div className="space-y-5">
        <Badge variant="outline" className="w-fit border-border/70 bg-background text-[0.62rem] text-muted-foreground">
          <ShoppingBag className="mr-1 h-3.5 w-3.5 text-primary" />
          Inventory Suite
        </Badge>
        <div className="space-y-2">
          <h1 className="max-w-sm text-[2rem] font-semibold tracking-tight text-foreground">
            Inventory that feels calm and direct.
          </h1>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            A restrained sign-in surface with a clean shopping animation and no excess copy.
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-border/70 bg-[#08101c]">
        <div className="mx-auto aspect-[4/3] w-full max-w-[420px]">
          <LottiePlayer animationData={shoppingAnimation} className="h-full w-full" />
        </div>
      </div>
    </section>
  );
}
