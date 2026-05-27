"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  gradient?: "indigo" | "cyan" | "purple" | "emerald" | "amber" | "rose";
  className?: string;
}

const gradientStyles = {
  indigo: {
    icon: "bg-chart-1 text-white",
    rail: "bg-chart-1",
    tint: "bg-chart-1/10 text-chart-1",
  },
  cyan: {
    icon: "bg-chart-2 text-white",
    rail: "bg-chart-2",
    tint: "bg-chart-2/10 text-chart-2",
  },
  purple: {
    icon: "bg-chart-5 text-white",
    rail: "bg-chart-5",
    tint: "bg-chart-5/10 text-chart-5",
  },
  emerald: {
    icon: "bg-chart-3 text-white",
    rail: "bg-chart-3",
    tint: "bg-chart-3/10 text-chart-3",
  },
  amber: {
    icon: "bg-chart-4 text-white",
    rail: "bg-chart-4",
    tint: "bg-chart-4/10 text-chart-4",
  },
  rose: {
    icon: "bg-rose-500 text-white",
    rail: "bg-rose-500",
    tint: "bg-rose-500/10 text-rose-600",
  },
};

export function StatCard({
  icon,
  title,
  value,
  change,
  changeLabel,
  gradient = "indigo",
  className,
}: StatCardProps) {
  const style = gradientStyles[gradient];
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/70 bg-card/95",
        "shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]",
        className
      )}
    >
      <div className={cn("absolute inset-y-0 left-0 w-1", style.rail)} />

      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </span>
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {value}
            </span>
            {change !== undefined && (
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                  isPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                )}>
                  {isPositive ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {isPositive ? "+" : ""}
                  {change}%
                </div>
                {changeLabel && (
                  <span className="text-[11px] text-muted-foreground">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-105",
              style.icon
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
