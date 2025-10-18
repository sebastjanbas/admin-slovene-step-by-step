import React from "react";
import { DataTable } from "./data-table";
import { langClubTable } from "@/db/schema";
import { asc } from "drizzle-orm";
import { EditDialogProvider } from "./edit-dialog-context";
import EditEventDialog from "./edit-event-dialog";
import db from "@/db";

const LangDataTable = async () => {
  const events = await db
    .select()
    .from(langClubTable)
    .orderBy(asc(langClubTable.date));
  const filteredEvents = events.filter((event) => event.date >= new Date());
  return (
    <>
      <EditDialogProvider>
        <DataTable data={events} filteredEvents={filteredEvents} />
        <EditEventDialog />
      </EditDialogProvider>
    </>
  );
};

export default LangDataTable;
