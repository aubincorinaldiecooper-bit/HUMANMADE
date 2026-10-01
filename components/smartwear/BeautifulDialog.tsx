"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/atoms/Button";

/**
 * Generic overlay adapted from Beautiful UI's AgentScreen expanded viewer.
 * Source: slev12397/beautiful-ui @ 44a274e598395ab61e7c96c26fda2758780253b7
 *
 * Preserves the upstream portal, body-scroll lock, Escape handling, backdrop,
 * pop-in motion, rounded overlay surface and quiet icon action.
 */
export default function BeautifulDialog({
  open,
  onClose,
  label,
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 dark:bg-black/75"
        style={{ animation: "fade-in 180ms ease-out both" }}
      />
      <div
        className={`relative max-h-full overflow-auto rounded-[16px] bg-surface shadow-overlay ${className}`}
        style={{ animation: "pop-in 240ms cubic-bezier(0.23,1,0.32,1) both" }}
      >
        <Button
          variant="quiet"
          size="xs"
          className="absolute right-3 top-3 z-20 size-8 p-0"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} />
        </Button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
