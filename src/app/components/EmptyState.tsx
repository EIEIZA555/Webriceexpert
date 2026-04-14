import { Card } from "./ui/card";

export function EmptyState({ message }: { message: string }) {
  return (
    <Card className="p-8 rounded-xl text-center text-muted-foreground text-sm">
      {message}
    </Card>
  );
}
