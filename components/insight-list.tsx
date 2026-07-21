import { AlertTriangle, ArrowRight, CircleDashed, ShieldAlert, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InsightListProps {
  title: string;
  description: string;
  items: string[];
  tone: "gap" | "uncertainty" | "recommendation";
}

const toneMap = {
  gap: {
    icon: CircleDashed,
    badge: "danger" as const,
    empty: "No major gaps identified in the current evidence set.",
  },
  uncertainty: {
    icon: ShieldAlert,
    badge: "warning" as const,
    empty: "No explicit uncertainty flags were returned for this run.",
  },
  recommendation: {
    icon: Sparkles,
    badge: "info" as const,
    empty: "No extra recommendations were returned for this run.",
  },
};

export function InsightList({ title, description, items, tone }: InsightListProps) {
  const config = toneMap[tone];
  const Icon = config.icon;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant={config.badge}>
            <Icon className="mr-1 size-3.5" />
            {items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <div className="space-y-3">
            {items.map((item) => (
              <div className="flex items-start gap-3 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4" key={item}>
                <div className="mt-1 rounded-xl bg-[var(--surface-strong)] p-2 text-[var(--accent)]">
                  <ArrowRight className="size-4" />
                </div>
                <p className="text-sm leading-7 text-[var(--foreground)]">{item}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted-foreground)]">
            <AlertTriangle className="size-4" />
            {config.empty}
          </div>
        )}
      </CardContent>
    </Card>
  );
}