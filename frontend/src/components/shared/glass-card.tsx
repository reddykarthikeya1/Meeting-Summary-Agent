import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function GlassCard({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card className={cn("glass hover:shadow-lg transition-shadow duration-300", className)} {...props}>
      {children}
    </Card>
  );
}
