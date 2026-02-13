/**
 * บันทึกสิ่งที่ต้องทำ - เก็บแยกตาม username (แต่ละ role เห็นของตัวเอง)
 */

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string; // ISO string
}

const STORAGE_PREFIX = "rice_expert_todos_";

function getStorageKey(username: string): string {
  return `${STORAGE_PREFIX}${username}`;
}

export function getTodos(username: string | null): TodoItem[] {
  if (!username || typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(username));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is TodoItem =>
        x && typeof x === "object" && typeof x.id === "string" && typeof x.text === "string"
    );
  } catch {
    return [];
  }
}

export function saveTodos(username: string | null, todos: TodoItem[]): void {
  if (!username || typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(username), JSON.stringify(todos));
  } catch (_) {
    // ignore
  }
}

export function addTodo(username: string | null, text: string): TodoItem[] {
  const list = getTodos(username);
  const newItem: TodoItem = {
    id: crypto.randomUUID(),
    text: text.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  };
  const next = [...list, newItem];
  saveTodos(username, next);
  return next;
}

export function toggleTodo(username: string | null, id: string): TodoItem[] {
  const list = getTodos(username);
  const next = list.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  saveTodos(username, next);
  return next;
}

export function deleteTodo(username: string | null, id: string): TodoItem[] {
  const list = getTodos(username).filter((t) => t.id !== id);
  saveTodos(username, list);
  return list;
}

export function updateTodo(
  username: string | null,
  id: string,
  text: string
): TodoItem[] {
  const list = getTodos(username);
  const next = list.map((t) =>
    t.id === id ? { ...t, text: text.trim() } : t
  );
  saveTodos(username, next);
  return next;
}
