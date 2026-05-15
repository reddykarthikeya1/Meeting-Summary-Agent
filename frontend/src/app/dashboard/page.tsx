"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckSquare,
  Users,
  ArrowRight,
  Video,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StaggerContainer, StaggerItem } from "@/components/shared/stagger-children";
import { GlassCard } from "@/components/shared/glass-card";
import { meetings, actionItems, analyticsOverview, meetingsOverTime } from "@/lib/mock-data";
import { formatDate, formatDuration, getInitials } from "@/lib/utils";
import { STATUS_COLORS, MEETING_TYPES } from "@/lib/constants";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const stats = [
  { label: "Total Meetings", value: analyticsOverview.total_meetings, icon: Calendar, change: "+6 this week", color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Hours Recorded", value: analyticsOverview.total_hours, icon: Clock, change: "+8.5 this week", color: "text-violet-500", bg: "bg-violet-500/10" },
  { label: "Action Items", value: `${analyticsOverview.completed_action_items}/${analyticsOverview.total_action_items}`, icon: CheckSquare, change: "26% completed", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Team Members", value: analyticsOverview.team_members, icon: Users, change: "2 new this month", color: "text-amber-500", bg: "bg-amber-500/10" },
];

const recentMeetings = meetings.slice(0, 5);
const upcomingActions = actionItems.filter(a => a.status !== "completed" && a.status !== "cancelled").slice(0, 5);

const priorityColors: Record<string, string> = {
  low: "bg-zinc-500/10 text-zinc-500",
  medium: "bg-blue-500/10 text-blue-500",
  high: "bg-amber-500/10 text-amber-500",
  urgent: "bg-red-500/10 text-red-500",
};

export default function DashboardPage() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          {greeting}, Alex. Here is your meeting overview.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <StaggerItem key={stat.label}>
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-3xl font-bold">{stat.value}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`rounded-xl ${stat.bg} p-3`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </GlassCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Meetings Over Time</CardTitle>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={meetingsOverTime}>
                    <defs>
                      <linearGradient id="meetingsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(160, 84%, 67%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(160, 84%, 67%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="meetings"
                      stroke="hsl(239, 84%, 67%)"
                      fill="url(#meetingsGradient)"
                      strokeWidth={2}
                      name="Meetings"
                    />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke="hsl(160, 84%, 67%)"
                      fill="url(#hoursGradient)"
                      strokeWidth={2}
                      name="Hours"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Meetings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-3"
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Meetings</CardTitle>
              <Link href="/dashboard/meetings">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMeetings.map((meeting) => {
                  const type = MEETING_TYPES.find((t) => t.value === meeting.meeting_type);
                  return (
                    <Link key={meeting.id} href={`/dashboard/meetings/${meeting.id}`}>
                      <div className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Video className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium group-hover:text-primary transition-colors">
                            {meeting.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(meeting.meeting_date)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDuration(meeting.duration_sec)}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            {type && (
                              <Badge variant="secondary" className="text-[10px]">
                                {type.label}
                              </Badge>
                            )}
                            <div className="flex -space-x-1.5">
                              {meeting.participants.slice(0, 3).map((p) => (
                                <Avatar key={p.id} className="h-5 w-5 border-2 border-background">
                                  <AvatarFallback className="text-[8px] bg-muted">
                                    {getInitials(p.name)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {meeting.participants.length > 3 && (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-muted text-[8px] text-muted-foreground">
                                  +{meeting.participants.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge className={`text-[10px] ${STATUS_COLORS[meeting.status]}`}>
                          {meeting.status}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Action Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Upcoming Action Items</CardTitle>
            <Link href="/dashboard/action-items">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {upcomingActions.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border p-3 transition-all hover:shadow-md hover:border-primary/30"
                >
                  <p className="line-clamp-2 text-sm font-medium">{item.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge className={`text-[10px] ${priorityColors[item.priority]}`}>
                      {item.priority}
                    </Badge>
                    {item.due_date && (
                      <span className="text-[10px] text-muted-foreground">
                        Due {formatDate(item.due_date)}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-[8px] bg-muted">
                        {getInitials(item.assigned_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{item.assigned_name}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
