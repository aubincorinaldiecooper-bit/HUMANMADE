"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { ChevronLeft, Library, PackageCheck, Plus, Shirt, Sparkles } from "lucide-react";
import GlideMenu from "@/components/primitives/GlideMenu";
import { StatusPill } from "@/components/atoms/StatusPill";

/**
 * Smartwear adaptation of Beautiful UI's SidebarNav.tsx
 * Source: slev12397/beautiful-ui @ 44a274e598395ab61e7c96c26fda2758780253b7
 *
 * Preserves the upstream rail motion, GlideMenu hover layer, compact row
 * geometry and collapse behavior. Product labels/icons are Smartwear-specific.
 * Central Icons are replaced by Lucide per repository policy.
 */

export type SmartwearNavKey = "create" | "library" | "products" | "orders";

const SIDEBAR_MOTION = {
  expandedWidth: 224,
  collapsedWidth: 52,
  duration: 280,
  copyDuration: 180,
  copyOffset: 8,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
};

const NAV_ITEMS: Array<{ key: SmartwearNavKey; label: string; icon: ReactNode }> = [
  { key: "create", label: "Create", icon: <Plus size={18} /> },
  { key: "library", label: "Library", icon: <Library size={18} /> },
  { key: "products", label: "Products", icon: <Shirt size={18} /> },
  { key: "orders", label: "Orders", icon: <PackageCheck size={18} /> },
];

function RailButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      data-row
      type="button"
      onClick={onClick}
      className={`sidebar-row relative z-10 mx-2 flex h-8 items-center rounded-[8px] px-2 text-left
        transition-[width,background-color,color,transform] duration-150 active:scale-[0.98]
        ${active ? "bg-hover-2 group-hover/glide:bg-transparent" : ""}`}
    >
      <span className={`flex size-5 shrink-0 items-center justify-center ${active ? "text-ink" : "text-ink-2"}`}>
        {icon}
      </span>
      <span className={`sidebar-copy ml-1.5 min-w-0 flex-1 truncate text-[14px] font-medium ${active ? "text-ink" : "text-ink-2"}`}>
        {label}
      </span>
    </button>
  );
}

export default function SmartwearSidebar({
  active = "create",
  onNavigate,
}: {
  active?: SmartwearNavKey;
  onNavigate?: (key: SmartwearNavKey) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      aria-label="Smartwear navigation"
      data-sidebar-collapsed={collapsed}
      className="sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-line bg-page sm:flex"
      style={{
        width: collapsed ? SIDEBAR_MOTION.collapsedWidth : SIDEBAR_MOTION.expandedWidth,
        transition: `width ${SIDEBAR_MOTION.duration}ms ${SIDEBAR_MOTION.easing}`,
        "--sidebar-copy-duration": `${SIDEBAR_MOTION.copyDuration}ms`,
        "--sidebar-copy-offset": `${SIDEBAR_MOTION.copyOffset}px`,
      } as CSSProperties}
    >
      <div className="flex h-full w-[224px] shrink-0 flex-col py-3">
        <div className="relative mb-2.5 h-10 shrink-0">
          <div
            aria-hidden={collapsed}
            className="sidebar-workspace-control absolute left-2 top-1 flex h-8 w-[164px] items-center rounded-[8px] px-2"
          >
            <span className="sidebar-logo flex size-5 shrink-0 items-center justify-center rounded-[6px] bg-ink text-canvas">
              <Sparkles size={13} />
            </span>
            <span className="sidebar-copy ml-1.5 min-w-0 flex-1 truncate text-[14px] font-medium text-ink-2">
              Smartwear Studio
            </span>
          </div>

          <button
            type="button"
            aria-label="Collapse sidebar"
            aria-hidden={collapsed}
            tabIndex={collapsed ? -1 : 0}
            onClick={() => setCollapsed(true)}
            className="sidebar-collapse-control absolute right-2 top-1 flex size-8 items-center justify-center rounded-[8px] text-ink-3 transition-[opacity,background-color,color] duration-150 hover:bg-hover-2 hover:text-ink"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Expand sidebar"
            aria-hidden={!collapsed}
            tabIndex={collapsed ? 0 : -1}
            onClick={() => setCollapsed(false)}
            className="sidebar-expand-control absolute left-2 top-0.5 flex size-9 items-center justify-center rounded-[8px] text-ink-3 transition-[opacity,background-color,color] duration-150 hover:bg-hover-2 hover:text-ink"
          >
            <ChevronLeft size={18} className="rotate-180" />
          </button>
        </div>

        <GlideMenu
          rowSelector="[data-row]"
          highlightClassName="sidebar-glide-highlight rounded-[7px] bg-hover-2"
          className="group/glide flex flex-col gap-px"
        >
          {NAV_ITEMS.map((item) => (
            <RailButton
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={active === item.key}
              onClick={() => onNavigate?.(item.key)}
            />
          ))}
        </GlideMenu>

        <div className="sidebar-copy mt-auto px-3">
          <div className="border-t border-line pt-3">
            <StatusPill tone="green" className="max-w-full">
              Prototype ready
            </StatusPill>
            <p className="mt-2 text-[11px] leading-relaxed text-ink-3">
              NFC and visual recognition are simulated in this frontend demo.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
