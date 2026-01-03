import { FormEvent, useEffect, useMemo, useState } from "react";
import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent } from "react";

import { createTodo, deleteTodo, fetchTodos, updateTodo } from "./api/todos";
import CreateTodoModal from "./components/CreateTodoModal";
import SortMenu from "./components/SortMenu";
import TodoCard from "./components/TodoCard";
import TodoDetailModal from "./components/TodoDetailModal";
import type { SortDirection, SortKey, Todo, UpdatePayload } from "./types/todo";
import { errorMessage, sortOptions, sortTodos, toDateInputValue, toISODate } from "./utils/todo";

function App() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState(3);
  const [newDue, setNewDue] = useState("");
  const [creating, setCreating] = useState(false);
  const [detailTitle, setDetailTitle] = useState("");
  const [detailPriority, setDetailPriority] = useState(3);
  const [detailDue, setDetailDue] = useState("");
  const [detailDone, setDetailDone] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<"open" | "done" | null>(null);

  useEffect(() => {
    void loadTodos(true);
  }, []);

  useEffect(() => {
    if (!selectedTodoId && !showCreateModal && !showSortMenu) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedTodoId(null);
        setShowCreateModal(false);
        setShowSortMenu(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTodoId, showCreateModal, showSortMenu]);

  const markUpdating = (id: number, active: boolean) => {
    setUpdatingIds((prev) => {
      const next = new Set(prev);
      if (active) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const sortedTodos = useMemo(
    () => sortTodos(todos, sortKey, sortDirection),
    [todos, sortKey, sortDirection],
  );

  const openTodos = useMemo(() => sortedTodos.filter((t) => !t.done), [sortedTodos]);
  const doneTodos = useMemo(() => sortedTodos.filter((t) => t.done), [sortedTodos]);
  const selectedTodo = useMemo(
    () => todos.find((todo) => todo.id === selectedTodoId) ?? null,
    [todos, selectedTodoId],
  );
  const selectedCount = selectedIds.size;
  const selectedOpenCount = useMemo(() => {
    if (selectedIds.size === 0) return 0;
    return todos.filter((todo) => selectedIds.has(todo.id) && !todo.done).length;
  }, [selectedIds, todos]);

  useEffect(() => {
    if (selectedTodoId === null) return;
    if (!selectedTodo) {
      setSelectedTodoId(null);
    }
  }, [selectedTodo, selectedTodoId]);

  useEffect(() => {
    if (!selectedTodo) return;
    setDetailTitle(selectedTodo.title);
    setDetailPriority(selectedTodo.priority);
    setDetailDue(toDateInputValue(selectedTodo.dueAt));
    setDetailDone(selectedTodo.done);
  }, [selectedTodo]);

  const sortDirectionLabel = useMemo(() => {
    switch (sortKey) {
      case "priority":
        return sortDirection === "asc" ? "低い順" : "高い順";
      case "title":
        return sortDirection === "asc" ? "昇順" : "降順";
      case "dueAt":
        return sortDirection === "asc" ? "近い順" : "遠い順";
      case "updatedAt":
        return sortDirection === "asc" ? "古い順" : "新しい順";
      default:
        return sortDirection === "asc" ? "昇順" : "降順";
    }
  }, [sortDirection, sortKey]);

  const sortKeyLabel = useMemo(() => {
    return sortOptions.find((option) => option.key === sortKey)?.label ?? "優先度";
  }, [sortKey]);

  const loadTodos = async (initial = false) => {
    if (initial) setLoading(true);
    setError(null);
    try {
      const data = await fetchTodos();
      setTodos(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    setShowSortMenu(false);
    setSelectedTodoId(null);
    setNewTitle("");
    setNewPriority(3);
    setNewDue("");
    setError(null);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelected = () => {
    setSelectedIds(new Set());
  };

  const updateTodoOptimistic = async (
    todo: Todo,
    patch: Partial<Todo>,
    payload: UpdatePayload,
  ) => {
    const snapshot = todos;
    markUpdating(todo.id, true);
    setError(null);
    setTodos((prev) =>
      prev.map((item) => (item.id === todo.id ? { ...item, ...patch } : item)),
    );

    try {
      const saved = await updateTodo(todo.id, payload);
      setTodos((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
    } catch (err) {
      setTodos(snapshot);
      setError(errorMessage(err));
    } finally {
      markUpdating(todo.id, false);
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTitle.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const todo = await createTodo(
        newTitle.trim(),
        newPriority,
        toISODate(newDue) ?? undefined,
      );
      setTodos((prev) => [...prev, todo]);
      setNewTitle("");
      setNewPriority(3);
      setNewDue("");
      setShowCreateModal(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (todo: Todo, done: boolean) => {
    await updateTodoOptimistic(
      todo,
      { done },
      {
        title: todo.title,
        done,
        priority: todo.priority,
        due_at: todo.dueAt ?? null,
      },
    );
  };

  const handleDetailSave = async () => {
    if (!selectedTodo) return;
    const trimmed = detailTitle.trim();
    if (!trimmed) {
      setError("タイトルを入力してください");
      return;
    }
    const nextDueAt = toISODate(detailDue) ?? null;

    await updateTodoOptimistic(
      selectedTodo,
      { title: trimmed, priority: detailPriority, dueAt: nextDueAt, done: detailDone },
      {
        title: trimmed,
        done: detailDone,
        priority: detailPriority,
        due_at: nextDueAt,
      },
    );
  };

  const handleDetailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTodo) return;
    const currentDueValue = toDateInputValue(selectedTodo.dueAt);
    const hasChanges =
      detailTitle.trim() !== selectedTodo.title ||
      detailPriority !== selectedTodo.priority ||
      detailDue !== currentDueValue ||
      detailDone !== selectedTodo.done;
    if (!hasChanges) return;
    await handleDetailSave();
  };

  const handleCardClick = (event: ReactMouseEvent<HTMLLIElement>, todo: Todo) => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-interactive='true']")) {
      return;
    }
    setSelectedTodoId(todo.id);
  };

  const closeDetails = () => {
    setSelectedTodoId(null);
  };

  const handleDeleteSelected = async () => {
    if (selectedCount === 0) return;
    const confirmed = window.confirm(`${selectedCount}件のタスクを削除しますか？`);
    if (!confirmed) return;

    const snapshot = todos;
    const ids = Array.from(selectedIds);
    setSelectedIds(new Set());
    setError(null);
    setTodos((prev) => prev.filter((item) => !ids.includes(item.id)));

    try {
      await Promise.all(ids.map((id) => deleteTodo(id)));
    } catch (err) {
      setTodos(snapshot);
      setError(errorMessage(err));
    }
  };

  const handleMarkSelectedDone = async () => {
    if (selectedCount === 0) return;
    const targets = todos.filter((todo) => selectedIds.has(todo.id) && !todo.done);
    if (targets.length === 0) {
      setSelectedIds(new Set());
      return;
    }
    const snapshot = todos;
    const ids = targets.map((todo) => todo.id);
    setSelectedIds(new Set());
    setError(null);
    ids.forEach((id) => markUpdating(id, true));
    setTodos((prev) =>
      prev.map((item) => (ids.includes(item.id) ? { ...item, done: true } : item)),
    );

    try {
      const saved = await Promise.all(
        targets.map((todo) =>
          updateTodo(todo.id, {
            title: todo.title,
            done: true,
            priority: todo.priority,
            due_at: todo.dueAt ?? null,
          }),
        ),
      );
      setTodos((prev) =>
        prev.map((item) => saved.find((next) => next.id === item.id) ?? item),
      );
    } catch (err) {
      setTodos(snapshot);
      setError(errorMessage(err));
    } finally {
      ids.forEach((id) => markUpdating(id, false));
    }
  };

  const handleDragStart = (event: ReactDragEvent<HTMLLIElement>, todo: Todo) => {
    if (isBusy(todo.id)) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(todo.id));
    setDraggingId(todo.id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDropTarget(null);
  };

  const handleDragOver = (target: "open" | "done", event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (dropTarget !== target) {
      setDropTarget(target);
    }
  };

  const handleDragLeave = (target: "open" | "done") => {
    if (dropTarget === target) {
      setDropTarget(null);
    }
  };

  const handleDrop = async (
    target: "open" | "done",
    event: ReactDragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    const id = Number(event.dataTransfer.getData("text/plain"));
    setDropTarget(null);
    setDraggingId(null);
    if (!id) return;
    const todo = todos.find((item) => item.id === id);
    if (!todo) return;
    const nextDone = target === "done";
    if (todo.done === nextDone) return;
    await handleStatusChange(todo, nextDone);
  };

  const handleDelete = async (todo: Todo) => {
    const confirmed = window.confirm(`「${todo.title}」を削除しますか？`);
    if (!confirmed) return;

    const snapshot = todos;
    setSelectedIds((prev) => {
      if (!prev.has(todo.id)) return prev;
      const next = new Set(prev);
      next.delete(todo.id);
      return next;
    });
    if (selectedTodoId === todo.id) {
      setSelectedTodoId(null);
    }
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

  const isBusy = (id: number) => updatingIds.has(id) || deletingId === id;
  const detailDueValue = selectedTodo ? toDateInputValue(selectedTodo.dueAt) : "";
  const detailHasChanges =
    !!selectedTodo &&
    (detailTitle.trim() !== selectedTodo.title ||
      detailPriority !== selectedTodo.priority ||
      detailDue !== detailDueValue ||
      detailDone !== selectedTodo.done);
  const detailCanSave = detailHasChanges && detailTitle.trim().length > 0;

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-8 app-shell">
        <header className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Todo Dashboard
            </h1>
            <p className="text-slate-400 text-sm">やることをサクッと追加・チェックできるミニマルなボード</p>
          </div>
        </header>

        {error && (
          <div className="card border border-danger/40 bg-danger/10 p-5 text-danger">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
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

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold text-white">ステータス別リスト</h2>
              {loading && (
                <span className="pill animate-pulse bg-slate-800 text-slate-300">Loading...</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <SortMenu
                show={showSortMenu}
                sortKey={sortKey}
                sortDirection={sortDirection}
                sortKeyLabel={sortKeyLabel}
                sortDirectionLabel={sortDirectionLabel}
                options={sortOptions}
                onToggle={() => setShowSortMenu((prev) => !prev)}
                onClose={() => setShowSortMenu(false)}
                onChangeKey={(key) => {
                  setSortKey(key);
                  setShowSortMenu(false);
                }}
                onChangeDirection={(direction) => setSortDirection(direction)}
              />
              <div
                className={`flex min-h-[2.25rem] items-center gap-2 transition ${
                  selectedCount > 0 ? "opacity-100" : "invisible pointer-events-none"
                }`}
                aria-hidden={selectedCount === 0}
              >
                <span className="text-xs text-slate-400">選択 {selectedCount}件</span>
                <button className="btn-ghost" type="button" onClick={clearSelected}>
                  解除
                </button>
                <button
                  className="btn-ghost text-success border-success/40 hover:bg-success/10"
                  type="button"
                  onClick={handleMarkSelectedDone}
                  disabled={selectedOpenCount === 0}
                >
                  完了
                </button>
                <button
                  className="btn-ghost text-danger border-danger/40 hover:bg-danger/10"
                  type="button"
                  onClick={handleDeleteSelected}
                >
                  削除
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                key: "open" as const,
                title: "Open",
                helper: "未完了",
                list: openTodos,
              },
              {
                key: "done" as const,
                title: "Done",
                helper: "完了",
                list: doneTodos,
              },
            ].map(({ key, title, helper, list }) => {
              const dropKey = key === "open" ? "open" : "done";
              const dropActive = dropTarget === dropKey;
              return (
                <div
                  key={key}
                  className={`card p-5 ${
                    dropActive ? "border-accent/60 ring-2 ring-accent/30" : ""
                  }`}
                  onDragOver={(event) => handleDragOver(dropKey, event)}
                  onDragLeave={() => handleDragLeave(dropKey)}
                  onDrop={(event) => void handleDrop(dropKey, event)}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-semibold text-white">{title}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{helper}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`count-chip text-base ${
                          key === "open" ? "count-chip-open" : "count-chip-done"
                        }`}
                      >
                        {list.length}
                      </span>
                      {key === "open" && (
                        <button
                          type="button"
                          className="icon-btn border-accent/60 text-accent bg-accent/20 shadow-glow hover:bg-accent/30"
                          onClick={openCreateModal}
                          aria-label="新規タスクを追加"
                        >
                          <span className="material-icons-round text-xl leading-none">add</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {loading ? (
                    <div className="grid gap-3">
                      {[1, 2].map((item) => (
                        <div key={item} className="h-16 rounded-xl bg-slate-800/60 animate-pulse" />
                      ))}
                    </div>
                  ) : list.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-4 text-center text-slate-400">
                      {key === "open" ? "未完了のタスクはありません" : "完了済みのタスクはありません"}
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {list.map((todo) => {
                        const busy = isBusy(todo.id);
                        const isSelected = selectedIds.has(todo.id);
                        return (
                          <TodoCard
                            key={todo.id}
                            todo={todo}
                            isSelected={isSelected}
                            isBusy={busy}
                            isDragging={draggingId === todo.id}
                            onToggleSelected={toggleSelected}
                            onClick={(event) => handleCardClick(event, todo)}
                            onDragStart={(event) => handleDragStart(event, todo)}
                            onDragEnd={handleDragEnd}
                          />
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
      <CreateTodoModal
        open={showCreateModal}
        title={newTitle}
        priority={newPriority}
        due={newDue}
        creating={creating}
        onClose={closeCreateModal}
        onSubmit={handleCreate}
        onTitleChange={setNewTitle}
        onPriorityChange={setNewPriority}
        onDueChange={setNewDue}
      />
      <TodoDetailModal
        open={!!selectedTodo}
        todo={selectedTodo}
        title={detailTitle}
        priority={detailPriority}
        due={detailDue}
        done={detailDone}
        busy={selectedTodo ? isBusy(selectedTodo.id) : false}
        canSave={detailCanSave}
        onClose={closeDetails}
        onDelete={() => selectedTodo && handleDelete(selectedTodo)}
        onSubmit={handleDetailSubmit}
        onTitleChange={setDetailTitle}
        onPriorityChange={setDetailPriority}
        onDueChange={setDetailDue}
        onDoneChange={setDetailDone}
      />
    </div>
  );
}

export default App;
