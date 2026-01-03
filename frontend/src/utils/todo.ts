import type { SortDirection, SortKey, Todo } from "../types/todo";

export const formatDate = (value: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  });
};

export const formatDateOnly = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const truncateTitle = (value: string) => {
  const chars = Array.from(value);
  if (chars.length <= 12) {
    return value;
  }
  return `${chars.slice(0, 12).join("")}...`;
};

const parseDateValue = (value?: string | null) => {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
};

const compareDate = (
  a?: string | null,
  b?: string | null,
  direction: SortDirection = "asc",
  missingLast = true,
) => {
  const timeA = parseDateValue(a);
  const timeB = parseDateValue(b);
  const missingA = timeA === null;
  const missingB = timeB === null;

  if (missingA || missingB) {
    if (missingA && missingB) return 0;
    if (missingLast) {
      return missingA ? 1 : -1;
    }
    return missingA ? -1 : 1;
  }

  return direction === "asc" ? timeA - timeB : timeB - timeA;
};

export const sortTodos = (items: Todo[], key: SortKey, direction: SortDirection) =>
  [...items].sort((a, b) => {
    let result = 0;

    switch (key) {
      case "title":
        result = a.title.localeCompare(b.title, "ja-JP", { sensitivity: "base" });
        result = direction === "asc" ? result : -result;
        break;
      case "priority":
        result = direction === "asc" ? a.priority - b.priority : b.priority - a.priority;
        break;
      case "dueAt":
        result = compareDate(a.dueAt, b.dueAt, direction, true);
        break;
      case "updatedAt":
        result = compareDate(a.updatedAt, b.updatedAt, direction, true);
        break;
      default:
        result = 0;
        break;
    }

    if (result !== 0) return result;
    const fallback = compareDate(a.createdAt, b.createdAt, "desc", false);
    if (fallback !== 0) return fallback;
    return a.id - b.id;
  });

export const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : "不明なエラーが発生しました";

export const toISODate = (value: string) => {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
};

export const toDateInputValue = (value?: string | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

export const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: "priority", label: "優先度" },
  { key: "title", label: "タイトル" },
  { key: "dueAt", label: "期日" },
  { key: "updatedAt", label: "更新日" },
];
