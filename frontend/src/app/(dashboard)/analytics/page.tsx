"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckSquare,
  Users,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StaggerContainer, StaggerItem } from "@/components/shared/stagger-children";
import { GlassCard } from "@/components/shared/glass-card";
import {
  analyticsOverview,
  speakerStats,
  meetingsOverTime,
  meetingsByType,
  actionItemsByStatus,
} from "@/lib/mock-data";
import { getInitials, formatDuration } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const stats = [
  { label: "Total Meetings", value: analyticsOverview.total_meetings, icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Hours Recorded", value: `${analyticsOverview.total_hours}h`, icon: Clock, color: "text-violet-500", bg: "bg-violet-500/10" },
  { label: "Action Items", value: analyticsOverview.total_action_items, icon: CheckSquare, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Team Members", value: analyticsOverview.team_members, icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Avg Duration", value: `${analyticsOverview.avg_duration}m`, icon: Clock, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { label: "This Week", value: analyticsOverview.meetings_this_week, icon: TrendingUp, color: "text-rose-500", bg: "bg-rose-500/10" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Insights and statistics about your meeting activity.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <StaggerItem key={stat.label}>
              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`rounded-xl ${stat.bg} p-3`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </GlassCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Meetings Over Time - Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Meetings Trend</CardTitle>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={meetingsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
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
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="meetings"
                      stroke="hsl(239, 84%, 67%)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Meetings"
                    />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke="hsl(160, 84%, 67%)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Hours"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Meetings by Type - Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Meetings by Type</CardTitle>
              <p className="text-sm text-muted-foreground">Distribution of meeting types</p>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={meetingsByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="type"
                    >
                      {meetingsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Items by Status - Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Action Items Status</CardTitle>
              <p className="text-sm text-muted-foreground">Current distribution of action items</p>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={actionItemsByStatus} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="status"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={90}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Count">
                      {actionItemsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Speaker Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Speaker Statistics</CardTitle>
              <p className="text-sm text-muted-foreground">Talk time distribution across team</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {speakerStats.map((speaker, i) => (
                  <div key={speaker.name} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs bg-muted">
                        {getInitials(speaker.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{speaker.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(speaker.talk_time_sec)} ({speaker.percentage}%)
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${speaker.percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {speaker.meeting_count} meetings attended
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
