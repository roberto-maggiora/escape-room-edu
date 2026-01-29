type RoomMapProps = {
  total: number;
  selectedIndex: number;
  activeIndex: number;
  completedCount: number;
  flashIndex: number | null;
  onSelect: (index: number, status: "active" | "completed" | "locked") => void;
};

const OBJECTS = [
  { name: "Armadio", icon: "🧰" },
  { name: "Cassaforte", icon: "🔐" },
  { name: "Porta", icon: "🚪" },
  { name: "Console", icon: "🖥️" },
  { name: "Cassettiera", icon: "🗄️" },
];

export default function RoomMap({
  total,
  selectedIndex,
  activeIndex,
  completedCount,
  flashIndex,
  onSelect,
}: RoomMapProps) {
  const items = OBJECTS.slice(0, Math.max(1, total));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const isSolved = index < completedCount;
          const isActive = index === activeIndex;
          const isLocked = index > completedCount;
          const isSelected = index === selectedIndex;
          const isFlashing = flashIndex === index;
          const status = isSolved ? "completed" : isActive ? "active" : "locked";
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onSelect(index, status)}
              disabled={isLocked}
              className={`flex h-full flex-col gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                isSolved
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : isActive
                    ? "border-slate-400 bg-slate-50 text-slate-900"
                    : "border-slate-200 bg-white text-slate-500"
              } ${isLocked ? "cursor-not-allowed opacity-60" : "hover:border-slate-300"} ${
                isSelected ? "ring-2 ring-indigo-200" : ""
              } ${isFlashing ? "animate-pulse" : ""}`}
            >
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{item.name}</span>
                <span>{isSolved ? "🔓" : "🔒"}</span>
              </div>
          <div className="text-3xl">{item.icon}</div>
          <p className="text-xs text-slate-500">
            {status === "completed"
              ? "Sbloccato"
              : status === "active"
                ? "Attivo"
                : "Bloccato"}
          </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
