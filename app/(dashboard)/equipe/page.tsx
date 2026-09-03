import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { verifySession } from "@/lib/dal";
import {
  getPeriodicReport,
  getUpcomingMeetings,
  listTeamMessages,
  listTeamReminders,
} from "@/services/TeamService";
import { reportPeriodSchema } from "@/lib/validation/team";
import { TeamChat } from "@/components/shared/team/team-chat";
import { TeamReminders } from "@/components/shared/team/team-reminders";
import { MeetingsAgenda } from "@/components/shared/team/meetings-agenda";
import { PeriodicReport } from "@/components/shared/team/periodic-report";

export const metadata: Metadata = {
  title: "Equipe",
  robots: { index: false, follow: false },
};

export default async function TeamPage(props: PageProps<"/equipe">) {
  await verifySession();
  const searchParams = await props.searchParams;
  const period = reportPeriodSchema.parse(searchParams.periodo);

  const [messages, reminders, meetings, report] = await Promise.all([
    listTeamMessages(),
    listTeamReminders(),
    getUpcomingMeetings(),
    getPeriodicReport(period),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Equipe</h1>
        <p className="text-muted-foreground">
          Mural para conversar com a equipe, lembretes rápidos, reuniões marcadas e o relatório do
          período.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mural da equipe</CardTitle>
            <CardDescription>Converse com o time em tempo real.</CardDescription>
          </CardHeader>
          <CardContent>
            <TeamChat initialMessages={messages} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lembretes</CardTitle>
            <CardDescription>Tarefas rápidas — qualquer um pode criar e marcar como feito.</CardDescription>
          </CardHeader>
          <CardContent>
            <TeamReminders reminders={reminders} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reuniões marcadas</CardTitle>
            <CardDescription>Leads em estágio &quot;Reunião&quot; com data de contato definida.</CardDescription>
          </CardHeader>
          <CardContent>
            <MeetingsAgenda meetings={meetings} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatório do período</CardTitle>
            <CardDescription>Resumo calculado ao vivo a partir do banco de dados.</CardDescription>
          </CardHeader>
          <CardContent>
            <PeriodicReport report={report} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
