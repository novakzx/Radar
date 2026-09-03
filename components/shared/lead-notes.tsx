"use client";

import { useActionState, useRef, useEffect } from "react";
import { addNoteAction, type NoteFormState } from "@/lib/actions/leads";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { LeadNoteItem } from "@/types/lead";

const initialState: NoteFormState = undefined;

export function LeadNotes({ leadId, notes }: { leadId: string; notes: LeadNoteItem[] }) {
  const actionWithId = addNoteAction.bind(null, leadId);
  const [state, action, pending] = useActionState(actionWithId, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const previousPending = useRef(pending);

  useEffect(() => {
    if (previousPending.current && !pending && !state?.errors && !state?.message) {
      formRef.current?.reset();
    }
    previousPending.current = pending;
  }, [pending, state]);

  return (
    <div className="space-y-4">
      <form ref={formRef} action={action} className="space-y-2">
        <Textarea name="content" placeholder="Adicionar nota sobre este lead..." rows={3} />
        {state?.errors?.content && (
          <p className="text-sm text-destructive">{state.errors.content[0]}</p>
        )}
        {state?.message && <p className="text-sm text-destructive">{state.message}</p>}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Salvando..." : "Adicionar nota"}
        </Button>
      </form>

      <div className="space-y-3">
        {notes.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma nota registrada ainda.</p>
        )}
        {notes.map((note) => (
          <div key={note.id} className="rounded-md border border-border p-3 text-sm">
            <p>{note.content}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {note.authorEmail} · {new Date(note.createdAt).toLocaleString("pt-BR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
