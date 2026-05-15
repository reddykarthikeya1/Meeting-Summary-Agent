"use client";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function StaggerContainer({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <motion.div variants={container} initial="hidden" animate="show" className={className}>{children}</motion.div>;
}

export function StaggerItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <motion.div variants={item} className={className}>{children}</motion.div>;
}
