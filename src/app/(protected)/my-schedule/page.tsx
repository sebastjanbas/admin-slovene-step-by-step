import TimeblockTabs from "@/app/(protected)/my-schedule/_components/timeblock-tabs";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { SessionData } from "@/components/calendar/types";
import { checkTutorActivation } from "@/actions/admin-actions";
import { ActivationWrapper } from "@/app/(protected)/my-schedule/_components/activation-wrapper";
import { getScheduleData, getAcceptedRegulars, getCancelledSessions } from "@/actions/timeblocks";

type SearchParams = {
  tab?: string;
  view?: string;
  month?: string;
};

function generateRecurringEvents(
  invitations: {
    id: number;
    tutorId: number;
    studentClerkId: string | null;
    dayOfWeek: number;
    startTime: string;
    duration: number;
    location: string;
  }[],
  cancelledSessions: {
    invitationId: number;
    cancelledDate: Date;
  }[]
): SessionData[] {
  const events: SessionData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate events for a rolling 3-month window
  const endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() + 3);

  // Create a Set of cancelled date strings for quick lookup
  const cancelledSet = new Set(
    cancelledSessions.map(
      (c) => `${c.invitationId}-${new Date(c.cancelledDate).toDateString()}`
    )
  );

  for (const inv of invitations) {
    // Find the first occurrence on or after today
    const current = new Date(today);
    const currentDayOfWeek = current.getDay();
    let daysUntil = inv.dayOfWeek - currentDayOfWeek;
    if (daysUntil < 0) daysUntil += 7;
    current.setDate(current.getDate() + daysUntil);

    const [hours, minutes] = inv.startTime.split(":").map(Number);

    while (current <= endDate) {
      const startTime = new Date(current);
      startTime.setHours(hours, minutes, 0, 0);

      // Check if this specific session is cancelled
      const isCancelled = cancelledSet.has(
        `${inv.id}-${current.toDateString()}`
      );

      events.push({
        id: -(inv.id * 1000 + events.length), // Negative IDs to avoid collision with real timeblocks
        tutorId: inv.tutorId,
        startTime,
        duration: inv.duration,
        status: isCancelled ? "cancelled" : "booked",
        sessionType: "regular",
        location: inv.location,
        studentId: inv.studentClerkId || "",
        invitationId: inv.id,
      });

      current.setDate(current.getDate() + 7);
    }
  }

  return events;
}

export default async function TimeblocksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw notFound();
  }

  const params = await searchParams;
  const isActivated = (await checkTutorActivation(userId)) as boolean;

  const [scheduleResult, regularsResult, cancelledResult] = await Promise.all([
    getScheduleData(),
    getAcceptedRegulars(),
    getCancelledSessions(),
  ]);

  const timeblocksData = (scheduleResult.data || []) as SessionData[];
  const acceptedRegulars = regularsResult.data || [];
  const cancelledSessions = cancelledResult.data || [];
  const recurringEvents = generateRecurringEvents(acceptedRegulars, cancelledSessions);
  const data = [...timeblocksData, ...recurringEvents];

  return (
    <div className="flex flex-col flex-1 min-h-0 p-5 space-y-6 w-full h-full">
      <ActivationWrapper isActivated={isActivated} />
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Schedule Planner
          </h1>
          <p className="text-muted-foreground">
            Manage your available teaching slots and recurring schedules
          </p>
        </div>
      </div>
      <TimeblockTabs data={data} initialTab={params.tab} />
    </div>
  );
}
