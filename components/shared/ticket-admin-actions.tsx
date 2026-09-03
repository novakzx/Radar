"use client";

import { useTransition } from "react";
import { CheckCheck, UserCheck, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  claimTicketAction,
  markTicketReadAction,
  resolveTicketAction,
} from "@/lib/actions/tickets";

interface TicketAdminActionsProps {
  ticketId: string;
  isRead: boolean;
  isClaimed: boolean;
  isResolved: boolean;
  size?: "xs" | "sm";
}

/** Botões de "marcar como lido", "reivindicar" e "resolver" — usados tanto na lista quanto no detalhe do ticket. */
export function TicketAdminActions({
  ticketId,
  isRead,
  isClaimed,
  isResolved,
  size = "sm",
}: TicketAdminActionsProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!isRead && (
        <Button
          size={size}
          variant="outline"
          disabled={isPending}
          onClick={() => startTransition(() => markTicketReadAction(ticketId))}
        >
          <CheckCheck className="size-3.5" />
          Marcar como lido
        </Button>
      )}
      {!isClaimed && (
        <Button
          size={size}
          variant="outline"
          disabled={isPending}
          onClick={() => startTransition(() => claimTicketAction(ticketId))}
        >
          <UserCheck className="size-3.5" />
          Reivindicar
        </Button>
      )}
      {!isResolved && (
        <Button
          size={size}
          variant="outline"
          disabled={isPending}
          onClick={() => startTransition(() => resolveTicketAction(ticketId))}
        >
          <CircleCheck className="size-3.5" />
          Marcar como resolvido
        </Button>
      )}
    </div>
  );
}
