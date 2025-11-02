import TimeblockTabs from "@/app/(protected)/timeblocks/_components/timeblock-tabs";
import {auth} from "@clerk/nextjs/server";
import {notFound} from "next/navigation";
import {timeblocksTable, tutorsTable} from "@/db/schema";
import db from "@/db";
import {eq} from "drizzle-orm";
import {toast} from "sonner";
import {SessionData} from "@/components/calendar/types";
import {checkTutorActivation} from "@/actions/admin-actions";

type SearchParams = {
  tab?: string;
  view?: string;
  month?: string;
};

export default async function TimeblocksPage({
                                               searchParams,
                                             }: {
  searchParams: SearchParams;
}) {
  const {userId} = await auth();

  if (!userId) {
    throw notFound();
  }

  const isActivated = await checkTutorActivation(userId);

  let data: SessionData[] = [];

  try {
    data = await db
      .select({
        id: timeblocksTable.id,
        tutorId: timeblocksTable.tutorId,
        startTime: timeblocksTable.startTime,
        duration: timeblocksTable.duration,
        status: timeblocksTable.status,
        sessionType: timeblocksTable.sessionType,
        location: timeblocksTable.location,
        studentId: timeblocksTable.studentId,
      })
      .from(timeblocksTable)
      .innerJoin(tutorsTable, eq(tutorsTable.id, timeblocksTable.tutorId))
      .where(eq(tutorsTable.clerkId, userId));
  } catch (error) {
    console.log(error);
    toast.error("Could not load booked sessions");
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 p-5 space-y-6 w-full h-full">
      {/*{!isActivated && (*/}
      {/*  <div className={"absolute bg-foreground/50 p-5 w-full top-0 left-0 h-full"}>*/}
      {/*    <h1>Activate your account!</h1>*/}
      {/*    <Button>*/}
      {/*      ACTIVATE*/}
      {/*    </Button>*/}

      {/*  </div>*/}
      {/*)}*/}
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
      <TimeblockTabs data={data} initialTab={searchParams.tab}/>
    </div>
  );
}
