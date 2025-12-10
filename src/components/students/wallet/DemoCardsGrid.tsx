import React from "react";

interface DemoCard {
  id: number;
  title: string;
  change: string;
  desc: string;
}

interface DemoCardsGridProps {
  cards: DemoCard[];
}

const DemoCardsGrid: React.FC<DemoCardsGridProps> = ({ cards }) => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {cards.map((card) => (
      <div
        key={card.id}
        className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-xl bg-slate-100" />
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-500">
            {card.change}
          </span>
        </div>
        <p className="mt-4 text-base font-semibold text-slate-800">{card.title}</p>
        <p className="mt-2 text-sm text-slate-400">{card.desc}</p>
      </div>
    ))}
  </div>
);

export default DemoCardsGrid;

