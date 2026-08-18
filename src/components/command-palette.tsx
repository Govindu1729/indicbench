"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Trophy,
  FlaskConical,
  Play,
  BookOpen,
  ArrowUp,
  GitBranchPlus,
  BarChart3,
  Search,
  LayoutDashboard,
  Layers,
  GitCompareArrows,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "hero", label: "Home / Hero", icon: LayoutDashboard, shortcut: "1" },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy, shortcut: "2" },
  { id: "benchmarks", label: "Benchmark Details", icon: FlaskConical, shortcut: "3" },
  { id: "evaluate", label: "Run Evaluation", icon: Play, shortcut: "4" },
  { id: "about", label: "About & Methodology", icon: BookOpen, shortcut: "5" },
];

const ACTION_ITEMS = [
  { label: "Export Leaderboard CSV", icon: ArrowUp, action: "export-csv" },
  { label: "Compare Models", icon: GitCompareArrows, action: "compare-models" },
  { label: "Submit Benchmark", icon: GitBranchPlus, action: "submit-benchmark" },
  { label: "Performance Heatmap", icon: BarChart3, action: "heatmap" },
  { label: "Score Distribution", icon: Layers, action: "distribution" },
];

interface CommandPaletteProps {
  onAction?: (action: string) => void;
}

export function CommandPalette({ onAction }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setOpen(false);
  }, []);

  const handleAction = useCallback((action: string) => {
    if (action === "export-csv") {
      // Trigger the export button
      const exportBtn = document.querySelector<HTMLButtonElement>('[aria-label="Export leaderboard as CSV"]');
      exportBtn?.click();
    } else if (action === "compare-models") {
      scrollTo("compare-models");
    } else if (action === "submit-benchmark") {
      scrollTo("submit-benchmark");
    } else if (action === "heatmap") {
      scrollTo("heatmap");
    } else if (action === "distribution") {
      scrollTo("insights");
    } else {
      onAction?.(action);
    }
    setOpen(false);
  }, [onAction, scrollTo]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="IndicBench Command Palette"
      description="Search sections, actions, and benchmarks..."
      className="dark-dialog-content"
    >
      <CommandInput placeholder="Search sections, actions, benchmarks..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.id}
                onSelect={() => scrollTo(item.id)}
                className="text-[#f5f5f7] hover:!bg-[rgba(245,158,11,0.1)] hover:!text-[#f59e0b]"
              >
                <Icon className="h-4 w-4 text-[#8b8b9e]" />
                {item.label}
                <CommandShortcut>⌘{item.shortcut}</CommandShortcut>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandGroup heading="Actions">
          {ACTION_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.action}
                onSelect={() => handleAction(item.action)}
                className="text-[#f5f5f7] hover:!bg-[rgba(245,158,11,0.1)] hover:!text-[#f59e0b]"
              >
                <Icon className="h-4 w-4 text-[#8b8b9e]" />
                {item.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandGroup heading="Quick Search">
          <CommandItem
            onSelect={() => {
              const searchInput = document.querySelector<HTMLInputElement>('input[placeholder="Search benchmarks..."]');
              if (searchInput) {
                scrollTo("benchmarks");
                setTimeout(() => searchInput.focus(), 300);
              }
              setOpen(false);
            }}
            className="text-[#f5f5f7] hover:!bg-[rgba(245,158,11,0.1)] hover:!text-[#f59e0b]"
          >
            <Search className="h-4 w-4 text-[#8b8b9e]" />
            Search benchmarks...
            <CommandShortcut>/</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
