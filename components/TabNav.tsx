"use client";

import React, { useRef } from "react";

export interface Tab {
  id: string;
  label: string;
  num: string;
  badge?: string;
}

interface TabNavProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export function TabNav({ tabs, active, onChange }: TabNavProps) {
  const navRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex: number | null = null;

    if (e.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const targetTab = tabs[nextIndex];
      onChange(targetTab.id);
      const buttons = navRef.current?.querySelectorAll<HTMLButtonElement>("button[role='tab']");
      buttons?.[nextIndex]?.focus();
    }
  };

  return (
    <div
      ref={navRef}
      role="tablist"
      aria-label="Platform Modules"
      className="flex gap-1 overflow-x-auto no-scrollbar scroll-smooth"
    >
      {tabs.map((tab, idx) => {
        const isSelected = active === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={isSelected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`group relative flex items-center whitespace-nowrap border-b-2 px-3.5 pb-3.5 pt-3 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal ${
              isSelected
                ? "border-teal text-teal font-semibold"
                : "border-transparent text-ink-soft hover:text-ink hover:border-line"
            }`}
          >
            <span
              className={`mr-1.5 font-mono text-xs transition-colors ${
                isSelected ? "text-clay font-bold" : "text-ink-soft/70 group-hover:text-ink-soft"
              }`}
            >
              {tab.num}
            </span>
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="ml-2 rounded-full bg-teal-wash px-1.5 py-0.5 text-[0.65rem] font-semibold text-teal">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
