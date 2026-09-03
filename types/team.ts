export interface TeamMessageItem {
  id: string;
  content: string;
  authorEmail: string;
  createdAt: string;
}

export interface TeamReminderItem {
  id: string;
  content: string;
  done: boolean;
  authorEmail: string;
  createdAt: string;
  doneAt: string | null;
}

export interface UpcomingMeetingItem {
  leadId: string;
  businessName: string;
  contactDate: string;
  ownerEmail: string | null;
}

export type ReportPeriod = "day" | "week";

export interface PeriodicReportData {
  period: ReportPeriod;
  rangeStart: string;
  rangeEnd: string;
  businessesFound: number;
  leadsCreated: number;
  leadsWonAsClient: number;
  searchesRun: number;
}
