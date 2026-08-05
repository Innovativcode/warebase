"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Box, CheckCircle2, Clock, Globe2, Package, Shield, Truck, Users, Warehouse, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { WarebaseLogo } from "@/components/brand/warebase-logo";
import { LottiePlayer } from "@/components/media/lottie-player";
import inventoryAnimation from "@/assets/lottie/Inventory.json";
import automationAnimation from "@/assets/lottie/automation.json";
import shoppingAnimation from "@/assets/lottie/shopping.json";

const FEATURES = [
  {
    icon: Package,
    title: "Real-time inventory tracking",
    description: "Monitor stock levels across all warehouses with live updates. Never lose track of what's in stock.",
  },
  {
    icon: Truck,
    title: "Smart purchase orders",
    description: "Automate restocking with intelligent reorder points and supplier management.",
  },
  {
    icon: Shield,
    title: "Role-based access control",
    description: "Granular permissions for every team member. Admins, managers, staff, and viewers with custom capabilities.",
  },
  {
    icon: BarChart3,
    title: "Operational dashboard",
    description: "Visual insights into movement trends, low-stock pressure, and governance queues.",
  },
  {
    icon: Warehouse,
    title: "Multi-warehouse support",
    description: "Manage inventory across multiple locations with seamless transfers and tracking.",
  },
  {
    icon: Zap,
    title: "Barcode scanning",
    description: "Mobile-optimized scanner with native and fallback decoders for instant product lookup.",
  },
];

const STATS = [
  { value: "99.9%", label: "Uptime" },
  { value: "50ms", label: "Real-time sync" },
  { value: "24/7", label: "Support" },
  { value: "100%", label: "Secure" },
];

export function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setSubmitted(true);
    toast.success("Thanks! We'll be in touch soon.");
    setEmail("");
    
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <WarebaseLogo className="h-8 shrink" taglineClassName="hidden md:block" />
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              Pricing
            </a>
            <a href="#contact" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              Contact
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" className="whitespace-nowrap px-3" onClick={() => router.push("/login")}>
              Sign in
            </Button>
            <Button size="sm" className="whitespace-nowrap px-3 sm:px-4" onClick={() => router.push("/register")}>
              Get started
              <ArrowRight className="ml-1.5 h-4 w-4 sm:ml-2" />
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-100/40 via-transparent to-transparent blur-3xl" />
          <div className="absolute right-0 top-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-slate-100/60 via-transparent to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="mx-auto max-w-4xl text-center lg:text-left">
              <h1 className="font-display text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                Every item,
                <span className="block bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                  in its place.
                </span>
              </h1>
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl lg:mx-0">
                The base layer for inventory that stays organized on its own. Real-time stock tracking, 
                intelligent purchasing, and warehouse control — all in one elegant platform.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <Button size="lg" onClick={() => router.push("/register")} className="px-8">
                  Start free trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => router.push("/login")} className="px-8">
                  Request demo
                </Button>
              </div>
              <p className="mt-6 text-sm text-slate-500">
                No credit card required · 14-day free trial · Cancel anytime
              </p>
            </div>
            <div className="relative mx-auto max-w-md lg:mx-0 lg:max-w-none">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-amber-100/40 via-slate-100/60 to-transparent blur-2xl" />
              <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-8 backdrop-blur-sm">
                <LottiePlayer 
                  animationData={inventoryAnimation} 
                  className="h-80 w-full"
                  preserveAspectRatio="xMidYMid meet"
                />
              </div>
            </div>
          </div>

          <div className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-4xl font-bold text-slate-900">{stat.value}</div>
                <div className="mt-2 text-sm font-medium text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-medium">
              Features
            </Badge>
            <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Everything you need to manage inventory
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              From real-time tracking to intelligent automation, WareBase gives you the tools 
              to keep your operations running smoothly.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="cursor-pointer border-slate-200/60 bg-white/60 backdrop-blur-sm transition-all hover:border-slate-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-medium">
                Why WareBase
              </Badge>
              <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Built for modern operations
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                WareBase combines simplicity with power. Get the insights you need without the complexity 
                you don't.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "Real-time synchronization across all devices",
                  "Intelligent alerts for low stock and reorder points",
                  "Comprehensive audit trail for every action",
                  "Mobile-optimized barcode scanning",
                  "Role-based permissions for team collaboration",
                  "Automated purchase order generation",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-amber-100/40 via-slate-100/60 to-transparent blur-2xl" />
              <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <LottiePlayer 
                    animationData={automationAnimation} 
                    className="h-64 w-full"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-amber-100/40 via-slate-100/60 to-transparent blur-2xl" />
              <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <LottiePlayer 
                    animationData={shoppingAnimation} 
                    className="h-64 w-full"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </CardContent>
              </Card>
            </div>
            <div className="order-1 lg:order-2">
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-medium">
                Smart Purchasing
              </Badge>
              <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Automated procurement
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Never run out of stock again. WareBase automatically generates purchase orders based on 
                your reorder points and supplier relationships.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "Automatic reorder point monitoring",
                  "Supplier relationship management",
                  "Purchase order approval workflows",
                  "Real-time order tracking",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="border-slate-200/60 bg-gradient-to-br from-white via-slate-50 to-white">
            <CardContent className="p-8 sm:p-12">
              <div className="mx-auto max-w-2xl text-center">
                <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-medium">
                  Get started
                </Badge>
                <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                  Ready to streamline your inventory?
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-slate-600">
                  Join the waitlist for early access or contact us for a personalized demo.
                </p>
                <form onSubmit={handleSubmit} className="mt-8">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1"
                      required
                    />
                    <Button type="submit" size="lg" disabled={submitted}>
                      {submitted ? "Thanks!" : "Join waitlist"}
                    </Button>
                  </div>
                </form>
                <p className="mt-4 text-sm text-slate-500">
                  Or{" "}
                  <a href="mailto:demo@warebase.io" className="font-medium text-amber-600 hover:underline">
                    contact us directly
                  </a>
                  {" "}for a live demo.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-slate-200/60 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <WarebaseLogo className="h-8" />
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-600 hover:text-slate-900">
                Privacy
              </a>
              <a href="#" className="text-sm text-slate-600 hover:text-slate-900">
                Terms
              </a>
              <a href="#" className="text-sm text-slate-600 hover:text-slate-900">
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} WareBase. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
