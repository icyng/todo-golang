import type { FormEvent } from "react";

import StarRating from "./StarRating";

type CreateTodoModalProps = {
  open: boolean;
  title: string;
  priority: number;
  due: string;
  creating: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTitleChange: (value: string) => void;
  onPriorityChange: (value: number) => void;
  onDueChange: (value: string) => void;
};

const CreateTodoModal = ({
  open,
  title,
  priority,
  due,
  creating,
  onClose,
  onSubmit,
  onTitleChange,
  onPriorityChange,
  onDueChange,
}: CreateTodoModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        aria-label="閉じる"
        onClick={onClose}
      />
      <form
        className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-glow"
        onSubmit={onSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">新規タスク</p>
            <h3 className="text-xl font-semibold text-white">タスクを追加</h3>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="閉じる">
            <span className="material-icons-round text-base">close</span>
          </button>
        </div>
        <div className="mt-5 grid gap-4">
          <input
            className="input text-sm"
            placeholder="タイトルを入力"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            disabled={creating}
            autoFocus
          />
          <div className="flex items-center justify-between gap-3">
            <span className="shrink-0 whitespace-nowrap text-xs uppercase tracking-[0.2em] text-slate-500">
              優先度
            </span>
            <StarRating
              value={priority}
              onChange={onPriorityChange}
              disabled={creating}
              size="md"
              label="優先度"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="shrink-0 whitespace-nowrap text-xs uppercase tracking-[0.2em] text-slate-500">
              期日
            </span>
            <input
              type="date"
              className="input text-sm w-40"
              value={due}
              onChange={(e) => onDueChange(e.target.value)}
              disabled={creating}
              aria-label="期限"
            />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button className="btn-ghost" type="button" onClick={onClose} disabled={creating}>
            キャンセル
          </button>
          <button className="btn-primary" type="submit" disabled={creating}>
            {creating ? "Saving..." : "追加"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTodoModal;
