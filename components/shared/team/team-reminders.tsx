"use client";

import { useRef, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTeamReminderAction, toggleTeamReminderAction } from "@/lib/actions/team";
import type { TeamReminderItem } from "@/types/team";

export function TeamReminders({ reminders }: { reminders: TeamReminderItem[] }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-3">
      <form
        ref={formRef}
        action={(formData) =>
          startTransition(async () => {
            await createTeamReminderAction(formData);
            formRef.current?.reset();
          })
        }
        className="flex gap-2"
      >
        <Input name="content" placeholder="Novo lembrete para a equipe..." autoComplete="off" />
        <Button type="submit" size="sm" disabled={isPending}>
          Adicionar
        </Button>
      </form>

      <ul className="space-y-2">
        {reminders.length === 0 && (
          <li className="text-sm text-muted-foreground">Nenhum lembrete pendente.</li>
        )}
        {reminders.map((reminder) => (
          <li key={reminder.id} className="flex items-start gap-2 text-sm">
            <Checkbox
              checked={reminder.done}
              onCheckedChange={(checked) =>
                startTransition(() => toggleTeamReminderAction(reminder.id, checked === true))
              }
              className="mt-0.5"
            />
            <div className={cn(reminder.done && "text-muted-foreground line-through")}>
              <p>{reminder.content}</p>
              <p className="text-xs text-muted-foreground">
                {reminder.authorEmail} · {new Date(reminder.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
