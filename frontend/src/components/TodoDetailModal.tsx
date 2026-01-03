import type { FormEvent } from "react";

import type { Todo } from "../types/todo";
import { formatDate } from "../utils/todo";
import StarRating from "./StarRating";

type TodoDetailModalProps = {
  open: boolean;
  todo: Todo | null;
  title: string;
  priority: number;
  due: string;
  done: boolean;
  busy: boolean;
  canSave: boolean;
  onClose: () => void;
  onDelete: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTitleChange: (value: string) => void;
  onPriorityChange: (value: number) => void;
  onDueChange: (value: string) => void;
  onDoneChange: (value: boolean) => void;
};

const TodoDetailModal = ({
  open,
  todo,
  title,
  priority,
  due,
  done,
  busy,
  canSave,
  onClose,
  onDelete,
  onSubmit,
  onTitleChange,
  onPriorityChange,
  onDueChange,
  onDoneChange,
}: TodoDetailModalProps) => {
  if (!open || !todo) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        aria-label="閉じる"
        onClick={onClose}
      />
      <form
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-glow"
        onSubmit={onSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">タスク詳細</p>
            <input
              className="input w-full text-lg font-semibold text-white"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              disabled={busy}
              aria-label="タイトル"
            />
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="閉じる" type="button">
            <span className="material-icons-round text-base">close</span>
          </button>
        </div>
        <div className="mt-5 grid gap-4 text-sm text-slate-200">
          <div className="flex items-center justify-between gap-4">
            <span className="shrink-0 whitespace-nowrap text-slate-400">優先度</span>
            <StarRating
              value={priority}
              onChange={onPriorityChange}
              disabled={busy}
              size="md"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="shrink-0 whitespace-nowrap text-slate-400">期日</span>
            <input
              type="date"
              className="input text-sm w-40"
              value={due}
              onChange={(event) => onDueChange(event.target.value)}
              disabled={busy}
              aria-label="期日"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="shrink-0 whitespace-nowrap text-slate-400">ステータス</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`chip ${done ? "" : "chip-active"}`}
                onClick={() => onDoneChange(false)}
                aria-pressed={!done}
                disabled={busy}
              >
                未完了
              </button>
              <button
                type="button"
                className={`chip ${done ? "chip-active" : ""}`}
                onClick={() => onDoneChange(true)}
                aria-pressed={done}
                disabled={busy}
              >
                完了
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="shrink-0 whitespace-nowrap text-slate-400">作成日</span>
            <span>{formatDate(todo.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="shrink-0 whitespace-nowrap text-slate-400">更新日</span>
            <span>{formatDate(todo.updatedAt)}</span>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            className="btn-ghost text-danger border-danger/40 hover:bg-danger/10"
            type="button"
            onClick={onDelete}
            disabled={busy}
          >
            削除
          </button>
          <div className="flex items-center gap-3">
            <button className="btn-ghost" type="button" onClick={onClose}>
              閉じる
            </button>
            <button className="btn-primary" type="submit" disabled={!canSave || busy}>
              保存
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TodoDetailModal;
