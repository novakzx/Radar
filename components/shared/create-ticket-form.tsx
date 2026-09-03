"use client";

import { useActionState, useRef, useEffect } from "react";
import { createTicketAction, type CreateTicketState } from "@/lib/actions/tickets";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const initialState: CreateTicketState = undefined;

export function CreateTicketForm() {
  const [state, action, pending] = useActionState(createTicketAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const previousPending = useRef(pending);

  useEffect(() => {
    if (previousPending.current && !pending && state?.ok) {
      formRef.current?.reset();
    }
    previousPending.current = pending;
  }, [pending, state]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="subject">Assunto</Label>
        <Input id="subject" name="subject" placeholder="Ex.: Pagamento não foi confirmado" required />
        {state?.errors?.subject && (
          <p className="text-sm text-destructive">{state.errors.subject[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Descreva o problema</Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Conte com detalhes o que aconteceu..."
          required
        />
        {state?.errors?.message && (
          <p className="text-sm text-destructive">{state.errors.message[0]}</p>
        )}
      </div>

      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}
      {state?.ok && (
        <p className="text-sm text-status-success">Ticket aberto! A equipe vai responder por aqui.</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Abrindo..." : "Abrir ticket"}
      </Button>
    </form>
  );
}
