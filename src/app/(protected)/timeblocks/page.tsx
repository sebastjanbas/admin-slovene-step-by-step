"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconCalendar,
  IconClock,
  IconTemplate,
  IconUsers,
} from "@tabler/icons-react";
import Calendar from "@/components/calendar/calendar";
import { TimeblockList } from "./_components/timeblock-list";
import { BookingManagement } from "./_components/booking-management";
import { RecurringTemplates } from "./_components/recurring-templates";
import { AddTimeblockDialog } from "./_components/add-timeblock-dialog";

export default function TimeblocksPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div className="space-y-6 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Schedule Planner
          </h1>
          <p className="text-muted-foreground">
            Manage your available teaching slots and recurring schedules
          </p>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="mx-auto">
          <TabsTrigger value="calendar" className="cursor-pointer">
            <IconCalendar className="mr-2 h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="list" className="cursor-pointer">
            <IconClock className="mr-2 h-4 w-4" />
            Time blocks
          </TabsTrigger>
          <TabsTrigger value="bookings" className="cursor-pointer">
            <IconUsers className="mr-2 h-4 w-4" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="templates" className="cursor-pointer">
            <IconTemplate className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="h-[800px]">
          <Calendar />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <TimeblockList />
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <BookingManagement />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <RecurringTemplates />
        </TabsContent>
      </Tabs>

      <AddTimeblockDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
}
