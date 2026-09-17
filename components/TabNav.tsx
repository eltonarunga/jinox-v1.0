"use client";

export interface Tab {
  id: string;
  label: string;
  num: string;
}

export function TabNav({
  tabs,
  active,
  onChange,
}: {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <nav className="flex gap-1 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`whitespace-nowrap border-b-2 px-4 pb-3.5 pt-3 text-sm font-medium transition-colors ${
            active === tab.id
              ? "border-teal text-teal"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          <span className="mr-1.5 font-mono text-xs text-clay">{tab.num}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
