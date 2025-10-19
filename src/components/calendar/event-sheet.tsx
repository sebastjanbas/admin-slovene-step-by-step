import React from "react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { timeblocksTable } from "@/db/schema";
import { STUDENTS } from "@/components/calendar/placeholder-data";
import {
  IconCalendar,
  IconCalendarEvent,
  IconClock,
  IconMail,
  IconMapPin,
  IconPhone,
  IconX,
} from "@tabler/icons-react";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

type EventSheetProps = {
  isEventSheetOpen: boolean;
  setIsEventSheetOpen: (open: boolean) => void;
  selectedSession: typeof timeblocksTable.$inferSelect | null;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800 border-green-200";
    case "booked":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "completed":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "no-show":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStudentInfo = (studentId: number) => {
  return STUDENTS.find((student) => student.id === studentId);
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("default", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("default", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const EventSheet = (props: EventSheetProps) => {
  const { selectedSession: event } = props;

  if (!event) {
    return (
      <Sheet
        open={props.isEventSheetOpen}
        onOpenChange={props.setIsEventSheetOpen}
      >
        <SheetContent className="w-[400px] sm:w-[540px] p-5">
          <SheetTitle>Event Details</SheetTitle>
          <p className="text-sm text-muted-foreground italic">
            No event selected
          </p>
        </SheetContent>
      </Sheet>
    );
  }

  const student = getStudentInfo(event.studentId);
  if (!student) return null;

  return (
    <Sheet
      open={props.isEventSheetOpen}
      onOpenChange={props.setIsEventSheetOpen}
    >
      <SheetContent className="w-[400px] sm:w-[540px] p-0">
        {props.selectedSession && (
          <div className="flex flex-col h-full">
            <div className="p-6 pb-4 flex justify-between items-center">
              <SheetTitle className="text-2xl font-bold">
                {event.startTime.toLocaleString("sl", {
                  month: "long",
                  day: "numeric",
                })}
              </SheetTitle>
              <Badge className={getStatusColor(event.status)}>
                {event.status}
              </Badge>
            </div>

            <Separator />

            {/* Content Section */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Session Overview */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Session Overview
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-gray-700">
                    description placeholder
                    {/* {event.description} */}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <IconClock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {event.duration} min
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  When
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconCalendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(new Date(props.selectedSession.startTime))}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatTime(new Date(props.selectedSession.startTime))}{" "}
                        -{" "}
                        {formatTime(
                          new Date(
                            event.startTime.getTime() + event.duration * 60000
                          )
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tutor Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Your Student
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student?.avatar} alt={student?.name} />
                      <AvatarFallback className="text-sm">
                        {student?.name?.split(" ")[0][0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {student?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <IconMail className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{student?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconPhone className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{student?.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Session Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <IconMapPin className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Location
                      </p>
                      <p className="text-sm text-gray-600">
                        {props.selectedSession.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="p-6">
              <div className="flex gap-3">
                {event.status === "cancelled" ? (
                  <Button className="flex-1" size="sm">
                    <IconCalendarEvent className="h-4 w-4 mr-2" />
                    Make available Session
                  </Button>
                ) : event.status === "booked" ? (
                  <>
                    <Button variant="destructive" size="sm" className="flex-1">
                      <IconX className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
