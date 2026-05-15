"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Filter,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaggerContainer, StaggerItem } from "@/components/shared/stagger-children";
import { actionItems } from "@/lib/mock-data";
import { formatDate, getInitials } from "@/lib/utils";
import { PRIORITY_COLORS } from "@/lib/constants";

type StatusFilter = "all" | "pending" | "in_progress" | "completed" | "cancelled";

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: "Pending", icon: Circle, color: "text-zinc-500" },
  in_progress: { label: "In Progress", icon: Clock, color: "text-blue-500" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-emerald-500" },
  cancelled: { label: "Cancelled", icon: AlertCircle, color: "text-red-500" },
};

export default function ActionItemsPage() {
  const [activeTab, setActiveTab] = useState<StatusFilter>("all");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    new Set(actionItems.filter((a) => a.status === "completed").map((a) => a.id))
  );

  const filtered = actionItems.filter((item) => {
    if (activeTab === "all") return true;
    return item.status === activeTab;
  });

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const counts = {
    all: actionItems.length,
    pending: actionItems.filter((a) => a.status === "pending").length,
    in_progress: actionItems.filter((a) => a.status === "in_progress").length,
    completed: actionItems.filter((a) => a.status === "completed").length,
    cancelled: actionItems.filter((a) => a.status === "cancelled").length,
  };

  // Group by status for Kanban
  const kanbanColumns = ["pending", "in_progress", "completed", "cancelled"] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Action Items</h1>
        <p className="mt-1 text-muted-foreground">
          Track and manage tasks extracted from your meetings.
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StatusFilter)}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all" className="gap-1.5">
            All
            <Badge variant="secondary" className="ml-1 text-[10px]">{counts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1.5">
            <Circle className="h-3.5 w-3.5 text-zinc-500" />
            Pending
            <Badge variant="secondary" className="ml-1 text-[10px]">{counts.pending}</Badge>
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="gap-1.5">
            <Clock className="h-3.5 w-3.5 text-blue-500" />
            In Progress
            <Badge variant="secondary" className="ml-1 text-[10px]">{counts.in_progress}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Completed
            <Badge variant="secondary" className="ml-1 text-[10px]">{counts.completed}</Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
            Cancelled
            <Badge variant="secondary" className="ml-1 text-[10px]">{counts.cancelled}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Kanban View for "all" tab */}
        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kanbanColumns.map((status) => {
              const config = statusConfig[status];
              const Icon = config.icon;
              const items = actionItems.filter((a) => a.status === status);

              return (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        {config.label}
                        <Badge variant="secondary" className="ml-auto text-[10px]">
                          {items.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          className="rounded-lg border border-border p-3 transition-all hover:shadow-md hover:border-primary/30"
                        >
                          <div className="flex items-start gap-2">
                            <button
                              className="mt-0.5 shrink-0"
                              onClick={() => toggleCheck(item.id)}
                            >
                              {checkedItems.has(item.id) ? (
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-medium leading-snug ${
                                checkedItems.has(item.id) ? "line-through text-muted-foreground" : ""
                              }`}>
                                {item.description}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <Badge className={`text-[9px] ${PRIORITY_COLORS[item.priority]}`}>
                                  {item.priority}
                                </Badge>
                                {item.due_date && (
                                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                    <Calendar className="h-2.5 w-2.5" />
                                    {formatDate(item.due_date)}
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 flex items-center gap-1.5">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-[8px] bg-muted">
                                    {getInitials(item.assigned_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] text-muted-foreground">
                                  {item.assigned_name}
                                </span>
                              </div>
                              {item.meeting_title && (
                                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <ArrowUpRight className="h-2.5 w-2.5" />
                                  {item.meeting_title}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {items.length === 0 && (
                        <p className="py-4 text-center text-xs text-muted-foreground">
                          No items
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Filtered views */}
        {(["pending", "in_progress", "completed", "cancelled"] as const).map((status) => (
          <TabsContent key={status} value={status} className="mt-6">
            <StaggerContainer className="space-y-2">
              {filtered.map((item) => (
                <StaggerItem key={item.id}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-start gap-3 p-4">
                      <button
                        className="mt-0.5 shrink-0"
                        onClick={() => toggleCheck(item.id)}
                      >
                        {checkedItems.has(item.id) ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${
                          checkedItems.has(item.id) ? "line-through text-muted-foreground" : ""
                        }`}>
                          {item.description}
                        </p>
                        {item.context && (
                          <p className="mt-1 text-xs text-muted-foreground">{item.context}</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge className={`text-[10px] ${PRIORITY_COLORS[item.priority]}`}>
                            {item.priority}
                          </Badge>
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[8px] bg-muted">
                                {getInitials(item.assigned_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{item.assigned_name}</span>
                          </div>
                          {item.due_date && (
                            <span className="text-xs text-muted-foreground">
                              Due {formatDate(item.due_date)}
                            </span>
                          )}
                          {item.meeting_title && (
                            <span className="text-xs text-muted-foreground">
                              from {item.meeting_title}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No {status.replace("_", " ")} items</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    All caught up! No action items with this status.
                  </p>
                </div>
              )}
            </StaggerContainer>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
