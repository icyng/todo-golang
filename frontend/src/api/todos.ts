import type { Todo, UpdatePayload } from "../types/todo";

const normalizeTodo = (input: any): Todo => ({
  id: input?.id ?? input?.ID ?? 0,
  title: input?.title ?? input?.Title ?? "",
  done: input?.done ?? input?.Done ?? false,
  createdAt: input?.created_at ?? input?.createdAt ?? input?.CreatedAt ?? "",
  updatedAt: input?.updated_at ?? input?.UpdatedAt ?? input?.updatedAt ?? "",
  priority: input?.priority ?? input?.Priority ?? 3,
  dueAt: input?.due_at ?? input?.dueAt ?? input?.DueAt ?? null,
});

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = res.statusText || "Unexpected error";
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch("/api/v1/todos");
  const data = await parseResponse<any[]>(res);
  return data.map(normalizeTodo);
}

export async function createTodo(
  title: string,
  priority: number,
  dueAt?: string,
): Promise<Todo> {
  const res = await fetch("/api/v1/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      priority,
      due_at: dueAt || undefined,
    }),
  });
  const data = await parseResponse<any>(res);
  return normalizeTodo(data);
}

export async function updateTodo(id: number, payload: UpdatePayload): Promise<Todo> {
  const res = await fetch(`/api/v1/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse<any>(res);
  return normalizeTodo(data);
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`/api/v1/todos/${id}`, { method: "DELETE" });
  await parseResponse(res);
}
