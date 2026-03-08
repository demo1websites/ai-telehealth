import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

const StatCard = ({ label, value, icon: Icon, trend, trendUp, className }: StatCardProps) => (
  <div className={cn("rounded-xl border border-border bg-card p-5 shadow-sm", className)}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        {trend && (
          <p className={cn("mt-1 text-xs font-medium", trendUp ? "text-primary" : "text-destructive")}>
            {trendUp ? "↑" : "↓"} {trend}
          </p>
        )}
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
    </div>
  </div>
);

export default StatCard;
