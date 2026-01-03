import type { SortDirection, SortKey } from "../types/todo";

type SortMenuProps = {
  show: boolean;
  sortKey: SortKey;
  sortDirection: SortDirection;
  sortKeyLabel: string;
  sortDirectionLabel: string;
  options: Array<{ key: SortKey; label: string }>;
  onToggle: () => void;
  onClose: () => void;
  onChangeKey: (key: SortKey) => void;
  onChangeDirection: (direction: SortDirection) => void;
};

const SortMenu = ({
  show,
  sortKey,
  sortDirection,
  sortKeyLabel,
  sortDirectionLabel,
  options,
  onToggle,
  onClose,
  onChangeKey,
  onChangeDirection,
}: SortMenuProps) => {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="chip"
        aria-haspopup="true"
        aria-expanded={show}
      >
        <span className="material-icons-round text-base">sort</span>
        <span>{sortKeyLabel}</span>
        <span className="text-slate-500">/</span>
        <span>{sortDirectionLabel}</span>
      </button>
      {show && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-20"
            aria-label="閉じる"
            onClick={onClose}
          />
          <div className="absolute left-0 z-30 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900/95 p-3 shadow-glow">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">並び替え項目</p>
            <div className="mt-2 grid gap-2">
              {options.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onChangeKey(option.key)}
                  className={`chip ${sortKey === option.key ? "chip-active" : ""}`}
                  aria-pressed={sortKey === option.key}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">順序</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => onChangeDirection("asc")}
                className={`chip ${sortDirection === "asc" ? "chip-active" : ""}`}
                aria-pressed={sortDirection === "asc"}
              >
                昇順
              </button>
              <button
                type="button"
                onClick={() => onChangeDirection("desc")}
                className={`chip ${sortDirection === "desc" ? "chip-active" : ""}`}
                aria-pressed={sortDirection === "desc"}
              >
                降順
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SortMenu;
