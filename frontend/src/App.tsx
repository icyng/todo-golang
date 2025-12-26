import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Todo = {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
};

type UpdatePayload = { title: string; done: boolean };

const normalizeTodo = (input: any): Todo => ({
  id: input?.id ?? input?.ID ?? 0,
  title: input?.title ?? input?.Title ?? "",
  done: input?.done ?? input?.Done ?? false,
  createdAt: input?.created_at ?? input?.createdAt ?? input?.CreatedAt ?? "",
  updatedAt: input?.updated_at ?? input?.updatedAt ?? input?.UpdatedAt ?? "",
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

async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch("/api/v1/todos");
  const data = await parseResponse<any[]>(res);
  return data.map(normalizeTodo);
}

async function createTodo(title: string): Promise<Todo> {
  const res = await fetch("/api/v1/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  const data = await parseResponse<any>(res);
  return normalizeTodo(data);
}

async function updateTodo(id: number, payload: UpdatePayload): Promise<Todo> {
  const res = await fetch(`/api/v1/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse<any>(res);
  return normalizeTodo(data);
}

async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`/api/v1/todos/${id}`, { method: "DELETE" });
  await parseResponse(res);
}

const formatDate = (value: string) => {
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

const safeDateValue = (value: string) => {
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
};

const sortTodos = (items: Todo[]) =>
  [...items].sort((a, b) => {
    if (a.done !== b.done) {
      return Number(a.done) - Number(b.done);
    }
    return safeDateValue(b.createdAt) - safeDateValue(a.createdAt);
  });

const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : "不明なエラーが発生しました";

function App() {
  const openCardRef = useRef<HTMLDivElement | null>(null);
  const doneCardRef = useRef<HTMLDivElement | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    void loadTodos(true);
  }, []);

  const stats = useMemo(() => {
    const total = todos.length;
    const done = todos.filter((t) => t.done).length;
    const open = total - done;
    return { total, open, done };
  }, [todos]);

  const openTodos = useMemo(() => todos.filter((t) => !t.done), [todos]);
  const doneTodos = useMemo(() => todos.filter((t) => t.done), [todos]);

  const loadTodos = async (initial = false) => {
    if (initial) setLoading(true);
    setError(null);
    try {
      const data = await fetchTodos();
      setTodos(sortTodos(data));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!newTitle.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const todo = await createTodo(newTitle.trim());
      setTodos((prev) => sortTodos([...prev, todo]));
      setNewTitle("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (todo: Todo) => {
    const updated: Todo = { ...todo, done: !todo.done };
    const snapshot = todos;
    setTodos((prev) =>
      sortTodos(prev.map((item) => (item.id === todo.id ? updated : item))),
    );
    try {
      const saved = await updateTodo(todo.id, {
        title: updated.title,
        done: updated.done,
      });
      setTodos((prev) =>
        sortTodos(prev.map((item) => (item.id === saved.id ? saved : item))),
      );
    } catch (err) {
      setTodos(snapshot);
      setError(errorMessage(err));
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const saveTitle = async (todo: Todo) => {
    const trimmed = editTitle.trim();
    if (!trimmed) {
      setError("タイトルを入力してください");
      return;
    }

    const snapshot = todos;
    setSavingId(todo.id);
    setError(null);
    setTodos((prev) =>
      sortTodos(
        prev.map((item) =>
          item.id === todo.id ? { ...item, title: trimmed } : item,
        ),
      ),
    );

    try {
      const saved = await updateTodo(todo.id, {
        title: trimmed,
        done: todo.done,
      });
      setTodos((prev) =>
        sortTodos(prev.map((item) => (item.id === saved.id ? saved : item))),
      );
      setEditingId(null);
      setEditTitle("");
    } catch (err) {
      setTodos(snapshot);
      setError(errorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (todo: Todo) => {
    const confirmed = window.confirm(`「${todo.title}」を削除しますか？`);
    if (!confirmed) return;

    const snapshot = todos;
    setDeletingId(todo.id);
    setError(null);
    setTodos((prev) => prev.filter((item) => item.id !== todo.id));

    try {
      await deleteTodo(todo.id);
    } catch (err) {
      setTodos(snapshot);
      setError(errorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const isBusy = (id: number) => savingId === id || deletingId === id;

  return (
    <div className="min-h-screen px-3 py-8 sm:px-4 md:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6 app-shell">
        <header className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Todo Dashboard
            </h1>
            <p className="text-slate-400 text-sm">やることをサクッと追加・チェックできるミニマルなボード</p>
          </div>
          <div className="menu-area">
            <button
              className="icon-btn menu-trigger"
              aria-label="メニュー"
              onClick={() => setShowMenu((v) => !v)}
            >
              <span className="material-icons-round text-base">menu</span>
            </button>
            {showMenu && (
              <div className="menu-pop">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="pill pill-strong pill-open">Open {stats.open}</span>
                  <span className="pill pill-strong pill-done">Done {stats.done}</span>
                  <span className="pill pill-strong pill-total">Total {stats.total}</span>
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="badge bg-accent/20 text-accent border border-accent/50">使い方</span>
                    <span>タスクをまとめて、完了や整理を進められます。</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-slate-700 text-slate-200 border border-slate-600">追加</span>
                    <span>Openカードから新規タスクを追加。</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-slate-700 text-slate-200 border border-slate-600">表示</span>
                    <span>登録・更新日時を一緒に確認。</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {error && (
          <div className="card border border-danger/40 bg-danger/10 p-4 text-danger">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <p className="font-semibold">{error}</p>
              </div>
              <button
                className="text-sm underline-offset-4 hover:underline"
                onClick={() => setError(null)}
              >
                閉じる
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">ステータス別リスト</h2>
            {loading && <span className="pill animate-pulse bg-slate-800 text-slate-300">Loading...</span>}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                key: "open" as const,
                title: "Open",
                helper: "未完了",
                list: openTodos,
                ref: openCardRef,
              },
              {
                key: "done" as const,
                title: "Done",
                helper: "完了",
                list: doneTodos,
                ref: doneCardRef,
              },
            ].map(({ key, title, helper, list, ref }) => {
              return (
                <div
                  key={key}
                  ref={ref}
                  className="card p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{helper}</p>
                      <p className="text-xl font-semibold text-white">{title}</p>
                    </div>
                    <span className="count-chip text-base">{list.length}</span>
                  </div>

                  {key === "open" && (
                    <form className="mb-3 flex flex-col gap-2 md:flex-row" onSubmit={handleCreate}>
                      <input
                        className="input md:flex-1 text-sm"
                        placeholder="Add task"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        disabled={creating}
                      />
                      <button className="btn-primary w-full md:w-auto" type="submit" disabled={creating}>
                        {creating ? "Saving..." : "Add"}
                      </button>
                    </form>
                  )}

                  {loading ? (
                    <div className="grid gap-2">
                      {[1, 2].map((item) => (
                        <div key={item} className="h-16 rounded-xl bg-slate-800/60 animate-pulse" />
                      ))}
                    </div>
                  ) : list.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-4 text-center text-slate-400">
                      {key === "open" ? "未完了のタスクはありません" : "完了済みのタスクはありません"}
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {list.map((todo) => {
                        const busy = isBusy(todo.id);
                        const editing = editingId === todo.id;
                        return (
                          <li
                            key={todo.id}
                            className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-2 transition hover:border-accent/40"
                          >
                            <div className="flex gap-3">
                              <input
                                type="checkbox"
                                checked={todo.done}
                                onChange={() => handleToggle(todo)}
                                disabled={busy}
                                className="mt-1 h-4 w-4 flex-shrink-0 rounded border border-slate-600 bg-slate-900 accent-accent"
                              />
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      {editing ? (
                                        <input
                                          className="input w-full md:w-72 text-sm"
                                          value={editTitle}
                                          onChange={(e) => setEditTitle(e.target.value)}
                                          disabled={busy}
                                          autoFocus
                                        />
                                      ) : (
                                        <h3 className="text-base font-semibold text-white">{todo.title}</h3>
                                      )}
                                      <span
                                        className={`badge ${
                                          todo.done
                                            ? "bg-success/20 text-success border border-success/40"
                                            : "bg-amber-400/20 text-amber-200 border border-amber-400/40"
                                        }`}
                                      >
                                        {todo.done ? "Done" : "In progress"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {editing ? (
                                      <>
                                        <button className="btn-primary" onClick={() => saveTitle(todo)} disabled={busy}>
                                          {busy ? "Saving..." : "Save"}
                                        </button>
                                        <button className="btn-ghost" onClick={cancelEditing} type="button" disabled={busy}>
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          className="icon-btn"
                                          onClick={() => startEditing(todo)}
                                          disabled={busy}
                                          aria-label="Edit"
                                        >
                                          <span className="material-icons-round text-base">edit</span>
                                        </button>
                                        <button
                                          className="icon-btn danger"
                                          onClick={() => handleDelete(todo)}
                                          disabled={busy}
                                          aria-label="Delete"
                                        >
                                          <span className="material-icons-round text-base">delete</span>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 text-xs text-slate-400">
                                  <span>作成: {formatDate(todo.createdAt)}</span>
                                  <span>更新: {formatDate(todo.updatedAt)}</span>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
