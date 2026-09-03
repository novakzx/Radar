import Link from "next/link";
import { CalendarClock } from "lucide-react";
import type { UpcomingMeetingItem } from "@/types/team";

export function MeetingsAgenda({ meetings }: { meetings: UpcomingMeetingItem[] }) {
  if (meetings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma reunião marcada. Defina uma data de contato num lead em estágio &quot;Reunião&quot;
        para aparecer aqui.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {meetings.map((meeting) => (
        <li key={meeting.leadId}>
          <Link
            href={`/crm/${meeting.leadId}`}
            className="flex items-center gap-3 rounded-md border border-border p-3 text-sm hover:bg-muted"
          >
            <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{meeting.businessName}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(meeting.contactDate).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
                {meeting.ownerEmail ? ` · ${meeting.ownerEmail}` : ""}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
