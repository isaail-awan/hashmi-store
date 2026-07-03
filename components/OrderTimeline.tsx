"use client";

import { PackageCheck, Truck, CheckCircle } from "lucide-react";

const STEPS = [
  { key: "placed", label: "Order Placed", icon: PackageCheck },
  { key: "dispatched", label: "Dispatched", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

interface OrderTimelineProps {
  order: {
    status: string;
    created_at: string;
    dispatched_at?: string | null;
    delivered_at?: string | null;
  };
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const statusIndex = order.status === "Delivered" ? 2 : order.status === "Dispatched" ? 1 : 0;
  const timestamps = [order.created_at, order.dispatched_at, order.delivered_at];

  return (
    <div className="flex items-start">
      {STEPS.map((step, i) => {
        const done = i <= statusIndex;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div className={`h-0.5 flex-1 transition-colors ${i <= statusIndex ? "bg-leaf" : "bg-border"}`} />
              )}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  done ? "border-leaf bg-leaf text-paper" : "border-border bg-white text-ink-soft"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 transition-colors ${i < statusIndex ? "bg-leaf" : "bg-border"}`} />
              )}
            </div>
            <p className={`mt-2 text-xs font-bold ${done ? "text-ink" : "text-ink-soft"}`}>{step.label}</p>
            {timestamps[i] && (
              <p className="mt-0.5 text-[10px] text-ink-soft">
                {new Date(timestamps[i] as string).toLocaleDateString()}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
