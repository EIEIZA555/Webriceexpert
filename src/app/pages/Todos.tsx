import { useState, useEffect } from "react";
import { getUsername } from "../lib/auth";
import {
  getTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
  type TodoItem,
} from "../lib/todos";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { CheckSquare, Square, Trash2, ListTodo, Plus } from "lucide-react";

export default function Todos() {
  const username = getUsername();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newText, setNewText] = useState("");

  useEffect(() => {
    setTodos(getTodos(username));
  }, [username]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setTodos(addTodo(username, newText));
    setNewText("");
  };

  const handleToggle = (id: string) => {
    setTodos(toggleTodo(username, id));
  };

  const handleDelete = (id: string) => {
    setTodos(deleteTodo(username, id));
  };

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">บันทึกสิ่งที่ต้องทำ</h2>
        <p className="text-sm text-muted-foreground mt-1">
          รายการที่ต้องทำส่วนตัว เห็นเฉพาะของบัญชีคุณเอง
        </p>
      </div>

      <Card className="p-6 rounded-xl shadow-sm mb-6">
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            type="text"
            placeholder="เพิ่มรายการใหม่..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="flex-1 rounded-lg"
          />
          <Button
            type="submit"
            disabled={!newText.trim()}
            className="rounded-lg shrink-0"
          >
            <Plus className="w-5 h-5 mr-2" />
            เพิ่ม
          </Button>
        </form>
      </Card>

      {todos.length === 0 ? (
        <Card className="p-12 rounded-xl shadow-sm text-center">
          <ListTodo className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">ยังไม่มีรายการ</h3>
          <p className="text-sm text-muted-foreground">
            เพิ่มสิ่งที่ต้องทำโดยพิมพ์ด้านบนแล้วกดเพิ่ม
          </p>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-3">
            ทำแล้ว {doneCount}/{todos.length} รายการ
          </p>
          <div className="space-y-2">
            {todos.map((todo) => (
              <Card
                key={todo.id}
                className={`p-4 rounded-xl shadow-sm flex items-center gap-3 transition-colors ${
                  todo.done ? "bg-muted/50" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(todo.id)}
                  className="shrink-0 p-1 rounded-lg hover:bg-accent transition-colors"
                  aria-label={todo.done ? "ยกเลิกทำเสร็จ" : "ทำเสร็จ"}
                >
                  {todo.done ? (
                    <CheckSquare className="w-6 h-6 text-primary" />
                  ) : (
                    <Square className="w-6 h-6 text-muted-foreground" />
                  )}
                </button>
                <span
                  className={`flex-1 text-left ${
                    todo.done ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(todo.id)}
                  className="shrink-0 p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label="ลบ"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
