"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { LottiePlayer } from "@/components/media/lottie-player";
import { WarebaseLogo } from "@/components/brand/warebase-logo";
import successAnimation from "@/assets/lottie/success.json";
import { WarebaseLoader } from "@/components/loader/warebase-loader";

const registerSchema = z
  .object({
    name: z.string().min(2, "Enter your full name").max(120),
    email: z.string().email("Enter a valid work email"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
    terms: z.boolean().refine((value) => value, "Accept the terms to continue"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterClientPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });
      toast.success("Account created successfully");
      router.replace("/onboarding/welcome");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create account right now");
    }
  });

  return (
    <AuthShell
      visual={
        <div className="space-y-6 px-2 py-4 text-slate-950">
          <WarebaseLogo />
          <div className="mx-auto aspect-[4/3] max-w-[560px]">
            <LottiePlayer animationData={successAnimation} className="h-full w-full" />
          </div>
        </div>
      }
    >
      <div className="rounded-[1.5rem] border border-border/70 bg-background p-6 shadow-[0_6px_18px_rgba(15,23,42,0.06)] sm:p-8 xl:ml-8">
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Create account</h1>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="name" placeholder="Amina Bello" className="pl-10" {...form.register("name")} />
            </div>
            {form.formState.errors.name ? <p className="text-sm text-destructive">{form.formState.errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                inputMode="email"
                placeholder="you@company.com"
                className="pl-10"
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="pl-10 pr-12"
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password ? <p className="text-sm text-destructive">{form.formState.errors.password.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repeat password"
                className="pl-10 pr-12"
                {...form.register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.confirmPassword ? (
              <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
            ) : null}
          </div>

          <div className="space-y-3 rounded-[0.9rem] border border-border/70 bg-muted/50 p-4">
            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border"
                {...form.register("terms")}
              />
              <div className="space-y-1">
                <Label htmlFor="terms" className="font-normal">
                  I agree to the terms of service
                </Label>
                <p className="text-sm text-muted-foreground">
                  Organization setup continues after sign-up.
                </p>
              </div>
            </div>
            {form.formState.errors.terms ? <p className="text-sm text-destructive">{form.formState.errors.terms.message}</p> : null}
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <span className="inline-flex items-center justify-center">
                <WarebaseLoader variant="compact" className="warebase-loader--on-dark" />
              </span>
            ) : (
              "Create account"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have access?{" "}
            <a href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
