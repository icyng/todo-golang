export type Todo = {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
  priority: number;
  dueAt?: string | null;
};

export type UpdatePayload = {
  title: string;
  done: boolean;
  priority?: number;
  due_at?: string | null;
};

export type SortKey = "priority" | "title" | "dueAt" | "updatedAt";

export type SortDirection = "asc" | "desc";
