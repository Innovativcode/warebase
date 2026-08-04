"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronRight, Warehouse } from "lucide-react";
import { LottiePlayer } from "@/components/media/lottie-player";
import foodChoiceAnimation from "@/assets/lottie/food-choice.json";

const goals = [
  "Retail inventory",
  "Wholesale or distribution",
  "Manufacturing",
  "Restaurant or food inventory",
  "Pharmacy or medical stock",
  "General warehouse inventory",
  "Other",
];

export default function OnboardingWelcomePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("Retail inventory");

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <Card className="w-full">
        <CardHeader className="flex-col items-start gap-3">
          <Badge variant="outline" className="border-border bg-muted/40 text-muted-foreground">
            Step 1 of 7
          </Badge>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Welcome to setup</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Tell us what you manage so we can preconfigure inventory defaults.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-5">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[0.9rem] border border-border bg-background p-4">
              <LottiePlayer animationData={foodChoiceAnimation} className="h-[220px] w-full" />
            </div>
            <div className="rounded-[0.9rem] border border-border bg-muted/35 p-4">
              <p className="text-sm font-medium text-foreground">Choose a starting point</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your selection helps tune the first location, stock policy, and inventory defaults without limiting future setup.
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {goals.map((goal) => {
              const active = selected === goal;
              return (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setSelected(goal)}
                  className={`flex items-center justify-between rounded-[0.9rem] border px-4 py-3 text-left transition-colors ${
                    active ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted/40"
                  }`}
                >
                  <span className="text-sm font-medium text-foreground">{goal}</span>
                  {active ? <Check className="h-4 w-4 text-primary" /> : null}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between rounded-[0.9rem] border border-border bg-muted/25 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[0.85rem] bg-primary/10 text-primary">
                <Warehouse className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Default setup will stay flexible</p>
                <p className="text-sm text-muted-foreground">You can change this later in settings.</p>
              </div>
            </div>
            <Badge variant="outline" className="border-border bg-background/60">
              Recommended
            </Badge>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => router.push("/onboarding/completion")}>
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
