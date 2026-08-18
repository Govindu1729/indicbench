"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, Command, HelpCircle } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/**
 * Navbar is now minimal — tab navigation is handled by the main page layout.
 * This component is kept for the mobile sheet menu and keyboard shortcuts help.
 * It's no longer rendered as a fixed scroll-based nav bar.
 */

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const openCommandPalette = useCallback(() => {
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      ctrlKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  }, []);

  return (
    <>
      {/* Mobile hamburger — only shown on small screens */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-[rgba(10,10,15,0.9)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] text-[#8b8b9e] hover:text-[#f5f5f7] transition-colors shadow-lg"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="right"
          className="bg-[#0a0a0f] border-l border-[rgba(255,255,255,0.08)]"
        >
          <SheetHeader>
            <SheetTitle className="text-lg font-bold font-[family-name:var(--font-playfair)] gradient-text-saffron">
              IndicBench
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-2 px-4 mt-4">
            <button
              onClick={() => {
                setMobileOpen(false);
                openCommandPalette();
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-left text-sm font-medium text-[#8b8b9e] hover:text-[#f5f5f7] hover:bg-[rgba(255,255,255,0.04)] border border-transparent transition-all"
            >
              <Search className="h-4 w-4" />
              Search...
            </button>
          </nav>
          <div className="mt-auto px-4 pb-4 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#8b8b9e]">
              v2.1
            </span>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] text-[#f59e0b]">
              <Command className="h-2.5 w-2.5" />K to search
            </span>
          </div>
        </SheetContent>
      </Sheet>

      {/* Keyboard Shortcuts Help Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="bg-[#111118] border border-[rgba(255,255,255,0.08)] text-[#f5f5f7] shadow-2xl backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-[family-name:var(--font-playfair)] gradient-text-saffron">
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription className="text-[#8b8b9e] text-sm">
              Navigate faster with these shortcuts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {[
              { keys: ["⌘", "K"], label: "Open search / command palette" },
              { keys: ["?"], label: "Toggle this help panel" },
            ].map((shortcut) => (
              <div
                key={shortcut.label}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]"
              >
                <span className="text-sm text-[#f5f5f7]">{shortcut.label}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, ki) => (
                    <kbd
                      key={ki}
                      className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] text-xs font-[family-name:var(--font-geist-mono)] text-[#f5f5f7]"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
