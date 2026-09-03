"use client";

import { useActionState, useRef, useEffect } from "react";
import { replyTicketAction, type ReplyTicketState } from "@/lib/actions/tickets";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const initialState: ReplyTicketState = undefined;

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const actionWithId = replyTicketAction.bind(null, ticketId);
  const [state, action, pending] = useActionState(actionWithId, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const previousPending = useRef(pending);

  useEffect(() => {
    if (previousPending.current && !pending && state?.ok) {
      formRef.current?.reset();
    }
    previousPending.current = pending;
  }, [pending, state]);

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <Textarea name="content" placeholder="Escreva uma resposta..." rows={3} required />
      {state?.errors?.content && (
        <p className="text-sm text-destructive">{state.errors.content[0]}</p>
      )}
      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Enviando..." : "Responder"}
      </Button>
    </form>
  );
}
