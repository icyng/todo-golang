import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent } from "react";

import type { Todo } from "../types/todo";
import { formatDateOnly, truncateTitle } from "../utils/todo";
import StarRating from "./StarRating";

type TodoCardProps = {
  todo: Todo;
  isSelected: boolean;
  isBusy: boolean;
  isDragging: boolean;
  onToggleSelected: (id: number) => void;
  onClick: (event: ReactMouseEvent<HTMLLIElement>) => void;
  onDragStart: (event: ReactDragEvent<HTMLLIElement>) => void;
  onDragEnd: () => void;
};

const TodoCard = ({
  todo,
  isSelected,
  isBusy,
  isDragging,
  onToggleSelected,
  onClick,
  onDragStart,
  onDragEnd,
}: TodoCardProps) => {
  return (
    <li
      onClick={onClick}
      className={`cursor-pointer rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 transition hover:border-accent/40 ${
        isSelected ? "border-accent/50 bg-slate-900/80" : ""
      } ${todo.done ? "opacity-70" : ""} ${isDragging ? "opacity-60" : ""}`}
      draggable={!isBusy}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelected(todo.id)}
          onClick={(event) => event.stopPropagation()}
          disabled={isBusy}
          data-interactive="true"
          aria-label="選択"
          className="mt-1 h-4 w-4 flex-shrink-0 rounded border border-slate-600 bg-slate-900 accent-accent"
        />
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-0 flex-1">
              <span
                className="block w-full truncate text-left text-sm font-semibold text-white"
                title={todo.title}
              >
                {truncateTitle(todo.title)}
              </span>
            </div>
            <div className="priority-pill">
              <StarRating value={todo.priority} size="sm" />
            </div>
            <div className={`deadline-pill ${todo.dueAt ? "" : "deadline-pill-muted"}`}>
              <span className="material-icons-round text-sm">event</span>
              <span>{todo.dueAt ? formatDateOnly(todo.dueAt) : "未設定"}</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500">クリックで詳細 / ドラッグで移動</span>
        </div>
      </div>
    </li>
  );
};

export default TodoCard;
