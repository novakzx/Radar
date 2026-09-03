"use client";

import { useEffect, useRef, useTransition } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postTeamMessageAction } from "@/lib/actions/team";
import { useTeamMessages } from "@/hooks/use-team-messages";
import type { TeamMessageItem } from "@/types/team";

export function TeamChat({ initialMessages }: { initialMessages: TeamMessageItem[] }) {
  const { data: messages } = useTeamMessages(initialMessages);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  return (
    <div className="flex h-[420px] flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma mensagem ainda — comece a conversa com a equipe.
          </p>
        )}
        {messages.map((message) => (
          <div key={message.id} className="text-sm">
            <div className="flex items-baseline gap-2">
              <span className="font-medium">{message.authorEmail}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(message.createdAt).toLocaleString("pt-BR")}
              </span>
            </div>
            <p className="text-muted-foreground">{message.content}</p>
          </div>
        ))}
      </div>

      <form
        ref={formRef}
        action={(formData) =>
          startTransition(async () => {
            await postTeamMessageAction(formData);
            formRef.current?.reset();
          })
        }
        className="mt-3 flex gap-2 border-t border-border pt-3"
      >
        <Input name="content" placeholder="Escreva uma mensagem para a equipe..." autoComplete="off" />
        <Button type="submit" size="icon" disabled={isPending} aria-label="Enviar mensagem">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
