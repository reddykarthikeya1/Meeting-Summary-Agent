"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  Zap,
  Users,
  FolderOpen,
  Lightbulb,
  UserCheck,
  Phone,
  Copy,
  Star,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StaggerContainer, StaggerItem } from "@/components/shared/stagger-children";
import { GlassCard } from "@/components/shared/glass-card";
import { templates } from "@/lib/mock-data";

const iconMap: Record<string, React.ElementType> = {
  Zap,
  Users,
  FolderOpen,
  Lightbulb,
  UserCheck,
  Phone,
};

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="mt-1 text-muted-foreground">
            Pre-built meeting structures to keep your conversations focused.
          </p>
        </div>
      </motion.div>

      {/* Template Grid */}
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Create New Template Card */}
        <StaggerItem>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="group cursor-pointer border-dashed transition-all hover:border-primary hover:shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="mb-4 rounded-full bg-muted p-4 transition-colors group-hover:bg-primary/10">
                  <Plus className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
                  Create Template
                </h3>
                <p className="mt-1 text-center text-sm text-muted-foreground">
                  Build a custom meeting template for your team.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </StaggerItem>

        {/* Template Cards */}
        {templates.map((template) => {
          const Icon = iconMap[template.icon] || Zap;

          return (
            <StaggerItem key={template.id}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <GlassCard className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        {template.is_default && (
                          <Badge variant="default" className="text-[10px]">
                            <Star className="mr-1 h-2.5 w-2.5" />
                            Default
                          </Badge>
                        )}
                        {template.is_system && (
                          <Badge variant="secondary" className="text-[10px]">
                            System
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="mt-3 text-base">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Sections */}
                      <div>
                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">Sections</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(template.structure.sections as string[]).map((section, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] font-normal">
                              {section}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {String(template.structure.duration_target ?? "30")} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Copy className="h-3 w-3" />
                            {template.usage_count} uses
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {template.category}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href="/dashboard/meetings/new" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            Use Template
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => toast.success("Template duplicated!")}>
                          <Copy className="mr-1 h-3 w-3" />
                          Duplicate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </GlassCard>
              </motion.div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </div>
  );
}
