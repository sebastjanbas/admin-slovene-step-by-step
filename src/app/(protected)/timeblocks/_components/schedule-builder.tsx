"use client";

import React, {useRef, useState, useCallback, useMemo} from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {DateSelectArg, EventClickArg} from "@fullcalendar/core";
import type {EventDropArg, EventResizeArg} from "@/components/calendar/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {IconTrash, IconCheck, IconCalendar} from "@tabler/icons-react";
import {toast} from "sonner";
import {createSchedule} from "@/actions/timeblocks";
import "@/components/calendar/calendar-styles.css";

interface TimeSlot {
  id: string;
  startTime: string;
  duration: number;
  sessionType: string;
  location: string;
  description?: string;
  color?: string;
}

// Helper function to convert hex to rgba with opacity
const hexToRgba = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

interface DaySchedule {
  day: number;
  timeSlots: TimeSlot[];
}

interface CalendarEvent {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:mm format
  duration: number;
  sessionType: string;
  location: string;
  description?: string;
  color: string;
}

const AVAILABLE_COLORS = [
  {value: "#3b82f6", label: "Blue", name: "blue"}, // Blue
  {value: "#10b981", label: "Green", name: "green"}, // Green
  {value: "#f59e0b", label: "Orange", name: "orange"}, // Orange
  {value: "#ef4444", label: "Red", name: "red"}, // Red
  {value: "#8b5cf6", label: "Purple", name: "purple"}, // Purple
  {value: "#ec4899", label: "Pink", name: "pink"}, // Pink
];

const getDefaultColorForSessionType = (sessionType: string): string => {
  const defaults: Record<string, string> = {
    private: "#3b82f6", // Blue for private
    group: "#10b981", // Green for group
    workshop: "#f59e0b", // Orange for workshop
    regulars: "#8b5cf6", // Purple for regulars
  };
  return defaults[sessionType] || "#3b82f6"; // Default to blue
};

const ScheduleBuilder = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    dayOfWeek: number;
    startTime: string;
    duration: number;
  } | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState<{
    startTime: string;
    duration: number;
    sessionType: string;
    location: string;
    description: string;
    color: string;
  }>({
    startTime: "09:00",
    duration: 60,
    sessionType: "private",
    location: "online",
    description: "",
    color: "#3b82f6",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysOfWeek = [
    {value: 1, label: "Monday", short: "Mon"},
    {value: 2, label: "Tuesday", short: "Tue"},
    {value: 3, label: "Wednesday", short: "Wed"},
    {value: 4, label: "Thursday", short: "Thu"},
    {value: 5, label: "Friday", short: "Fri"},
    {value: 6, label: "Saturday", short: "Sat"},
    {value: 0, label: "Sunday", short: "Sun"},
  ];

  // Get a reference week date (we'll use the current week, but dates don't matter)
  const getReferenceDate = useCallback(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(today.setDate(diff));
    return monday;
  }, []);

  // Convert day of week (0-6) to a date in the reference week
  const getDateForDayOfWeek = useCallback(
    (dayOfWeek: number, startTime: string) => {
      const referenceMonday = getReferenceDate();
      // Convert day of week: 0=Sunday, 1=Monday, etc.
      // Reference Monday is day 1, so we need to adjust
      const dayDiff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 6 days after Monday
      const date = new Date(referenceMonday);
      date.setDate(date.getDate() + dayDiff);

      // Add the time
      const [hours, minutes] = startTime.split(":").map(Number);
      date.setHours(hours, minutes, 0, 0);

      return date;
    },
    [getReferenceDate]
  );

  // Convert date to day of week (0-6) and time string
  const getDayAndTimeFromDate = useCallback((date: Date) => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const startTime = `${hours}:${minutes}`;
    return {dayOfWeek, startTime};
  }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const {dayOfWeek, startTime} = getDayAndTimeFromDate(selectInfo.start);

    // Calculate duration from the selected range
    const durationMs = selectInfo.end.getTime() - selectInfo.start.getTime();
    const durationMinutes = Math.round(durationMs / 60000); // Convert to minutes

    // Ensure minimum duration of 15 minutes
    const finalDuration = Math.max(15, Math.round(durationMinutes / 15) * 15); // Round to nearest 15 minutes

    // Check if there's already an event at this time slot
    const existingEvent = events.find(
      (e) => e.dayOfWeek === dayOfWeek && e.startTime === startTime
    );

    if (existingEvent) {
      // Edit existing event
      setEditingEvent(existingEvent);
      setFormData({
        startTime: existingEvent.startTime,
        duration: existingEvent.duration,
        sessionType: existingEvent.sessionType,
        location: existingEvent.location,
        description: existingEvent.description || "",
        color: existingEvent.color,
      });
      setSelectedSlot({
        dayOfWeek,
        startTime: existingEvent.startTime,
        duration: existingEvent.duration,
      });
    } else {
      // Create new event - duration is set by drag selection
      setEditingEvent(null);
      const defaultColor = getDefaultColorForSessionType("private");
      setFormData({
        startTime,
        duration: finalDuration,
        sessionType: "private",
        location: "online",
        description: "",
        color: defaultColor,
      });
      setSelectedSlot({
        dayOfWeek,
        startTime,
        duration: finalDuration,
      });
    }

    setIsSheetOpen(true);

    // Unselect the date range
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const eventId = clickInfo.event.id;
    const event = events.find((e) => e.id === eventId);

    if (event) {
      setEditingEvent(event);
      setFormData({
        startTime: event.startTime,
        duration: event.duration,
        sessionType: event.sessionType as string,
        location: event.location,
        description: event.description || "",
        color: event.color,
      });
      setSelectedSlot({
        dayOfWeek: event.dayOfWeek,
        startTime: event.startTime,
        duration: event.duration,
      });
      setIsSheetOpen(true);
    }
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    const eventId = dropInfo.event.id;
    const newStart = dropInfo.event.start;

    if (!newStart) {
      dropInfo.revert();
      return;
    }

    const {dayOfWeek, startTime} = getDayAndTimeFromDate(newStart);

    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
            ...e,
            dayOfWeek,
            startTime,
          }
          : e
      )
    );

    toast.success("Event moved");
  };

  const handleEventResize = (resizeInfo: EventResizeArg) => {
    const eventId = resizeInfo.event.id;
    const newStart = resizeInfo.event.start;
    const newEnd = resizeInfo.event.end;

    if (!newStart || !newEnd) {
      resizeInfo.revert();
      return;
    }

    // Calculate new duration
    const durationMs = newEnd.getTime() - newStart.getTime();
    const durationMinutes = Math.max(15, Math.round(durationMs / 60000));
    // Round to nearest 15 minutes
    const finalDuration = Math.round(durationMinutes / 15) * 15;

    const {dayOfWeek, startTime} = getDayAndTimeFromDate(newStart);

    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
            ...e,
            dayOfWeek,
            startTime,
            duration: finalDuration,
          }
          : e
      )
    );

    toast.success("Event resized");
  };

  const handleSaveSlot = () => {
    if (!selectedSlot) return;

    // Validate
    if (
      !formData.startTime ||
      !formData.duration ||
      !formData.sessionType ||
      !formData.location
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingEvent) {
      // Update existing event
      setEvents((prev) =>
        prev.map((e) =>
          e.id === editingEvent.id
            ? {
              ...e,
              startTime: formData.startTime,
              duration: formData.duration,
              sessionType: formData.sessionType,
              location: formData.location,
              description: formData.description,
              color: formData.color,
            }
            : e
        )
      );
      toast.success("Time slot updated");
    } else {
      // Add new event
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        dayOfWeek: selectedSlot.dayOfWeek,
        startTime: formData.startTime,
        duration: formData.duration,
        sessionType: formData.sessionType,
        location: formData.location,
        description: formData.description,
        color: formData.color,
      };
      setEvents((prev) => [...prev, newEvent]);
      toast.success("Time slot added");
    }

    setIsSheetOpen(false);
    setSelectedSlot(null);
    setEditingEvent(null);
  };

  const handleDeleteSlot = () => {
    if (!editingEvent) return;

    setEvents((prev) => prev.filter((e) => e.id !== editingEvent.id));
    toast.success("Time slot deleted");
    setIsSheetOpen(false);
    setSelectedSlot(null);
    setEditingEvent(null);
  };

  // Convert calendar events to DaySchedule[] format
  const convertToDaySchedules = useCallback((): DaySchedule[] => {
    const schedulesMap = new Map<number, TimeSlot[]>();

    events.forEach((event) => {
      const timeSlot: TimeSlot = {
        id: event.id,
        startTime: event.startTime,
        duration: event.duration,
        sessionType: event.sessionType as string,
        location: event.location,
        description: event.description,
        color: event.color,
      };

      if (!schedulesMap.has(event.dayOfWeek)) {
        schedulesMap.set(event.dayOfWeek, []);
      }
      schedulesMap.get(event.dayOfWeek)!.push(timeSlot);
    });

    // Convert map to array and sort by day
    const daySchedules: DaySchedule[] = Array.from(schedulesMap.entries())
      .map(([day, timeSlots]) => ({
        day,
        timeSlots: timeSlots.sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        ),
      }))
      .sort((a, b) => (a.day === 0 ? 7 : a.day) - (b.day === 0 ? 7 : b.day));

    return daySchedules;
  }, [events]);

  const handleSubmitClick = () => {
    const daySchedules = convertToDaySchedules();

    if (daySchedules.length === 0) {
      toast.error("No schedule data to submit");
      return;
    }

    setIsConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = async () => {
    const daySchedules = convertToDaySchedules();

    setIsSubmitting(true);
    setIsConfirmDialogOpen(false);

    try {
      const result = await createSchedule(daySchedules);

      if (result?.success) {
        toast.success("Schedule saved successfully!");
        // Optionally clear events after successful submission
        // setEvents([]);
      } else {
        toast.error(result?.message || "Failed to save schedule");
      }
    } catch (error) {
      console.error("Error submitting schedule:", error);
      toast.error("Failed to save schedule");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert events to FullCalendar format
  const calendarEvents = useMemo(() => {
    return events.map((event) => {
      const startDate = getDateForDayOfWeek(event.dayOfWeek, event.startTime);
      const endDate = new Date(startDate.getTime() + event.duration * 60000);

      return {
        id: event.id,
        title: `${event.sessionType} • ${event.location}`,
        start: startDate,
        end: endDate,
        backgroundColor: event.color,
        borderColor: event.color,
        textColor: "#ffffff",
        extendedProps: {
          sessionType: event.sessionType,
          location: event.location,
          description: event.description,
          color: event.color,
        },
      };
    });
  }, [events, getDateForDayOfWeek]);

  const totalSlots = events.length;

  const getDayLabel = (dayValue: number) => {
    return (
      daysOfWeek.find((d) => d.value === dayValue)?.label || dayValue.toString()
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex flex-col relative">
      {/* Floating Submit Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={handleSubmitClick}
          disabled={totalSlots === 0 || isSubmitting}
          size="sm"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"/>
              Saving...
            </>
          ) : (
            <>
              <IconCheck className="h-4 w-4 mr-2"/>
              Submit Schedule
            </>
          )}
        </Button>
      </div>

      {/* Full Screen Calendar */}
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={false}
        height="100%"
        allDaySlot={false}
        editable={true}
        eventStartEditable={true}
        eventDurationEditable={true}
        eventResizableFromStart={true}
        eventOverlap={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={false}
        weekends={true}
        firstDay={1} // Monday
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
        slotDuration="00:30:00"
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        events={calendarEvents}
        selectConstraint={{
          start: "06:00",
          end: "24:00",
        }}
        dayHeaderFormat={{weekday: "short"}}
        eventContent={(eventInfo) => {
          return (
            <div
              style={{
                backgroundColor: eventInfo.event.backgroundColor || "#3b82f6",
                color: "#ffffff",
                padding: "4px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                height: "100%",
                width: "100%",
                display: "flex",
                alignItems: "center",
                fontWeight: 500,
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
            >
              <div style={{width: "100%", overflow: "hidden"}}>
                <div
                  style={{
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {eventInfo.event.title}
                </div>
                <div style={{fontSize: "0.75rem", opacity: 0.9}}>
                  {eventInfo.timeText}
                </div>
              </div>
            </div>
          );
        }}
      />

      {/* Add/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg p-5">
          <SheetHeader>
            <SheetTitle>
              {editingEvent ? "Edit Time Slot" : "Add Time Slot"}
            </SheetTitle>
            <SheetDescription>
              {selectedSlot &&
                `${getDayLabel(selectedSlot.dayOfWeek)} at ${
                  selectedSlot.startTime
                } • ${selectedSlot.duration} minutes`}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            <div className="w-full flex flex-col justify-between items-center">
              <div className="flex gap-2 flex-wrap mt-2">
                {AVAILABLE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      setFormData({...formData, color: color.value})
                    }
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      formData.color === color.value
                        ? "border-foreground scale-110 ring-2 ring-offset-2 ring-offset-background ring-foreground"
                        : "border-muted hover:border-foreground/50"
                    }`}
                    style={{backgroundColor: color.value}}
                    aria-label={`Select ${color.label} color`}
                    title={color.label}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Selected:{" "}
                {AVAILABLE_COLORS.find((c) => c.value === formData.color)
                  ?.label || "Custom"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Session Type</Label>
                <Select
                  value={formData.sessionType}
                  onValueChange={(value) => {
                    const defaultColor = getDefaultColorForSessionType(value);
                    setFormData({
                      ...formData,
                      sessionType: value,
                      color: defaultColor,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="regulars">Regulars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) =>
                    setFormData({...formData, location: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="classroom">Classroom</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description (optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({...formData, description: e.target.value})
                }
                placeholder="Add notes about this time slot..."
                rows={4}
              />
            </div>
          </div>

          <SheetFooter className="flex justify-between sm:justify-between">
            {editingEvent && (
              <Button
                variant="destructive"
                onClick={handleDeleteSlot}
                type="button"
              >
                <IconTrash className="h-4 w-4 mr-2"/>
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                onClick={() => {
                  setIsSheetOpen(false);
                  setSelectedSlot(null);
                  setEditingEvent(null);
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveSlot} type="button">
                <IconCheck className="h-4 w-4 mr-2"/>
                Save
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog with Summary */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirm Schedule Submission</DialogTitle>
            <DialogDescription>
              Please review your schedule before submitting. This will save{" "}
              {totalSlots} time slot{totalSlots !== 1 ? "s" : ""} across{" "}
              {convertToDaySchedules().length} day
              {convertToDaySchedules().length !== 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {convertToDaySchedules().map((schedule) => (
              <div
                key={schedule.day}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center gap-2 mb-2">
                  <IconCalendar className="h-4 w-4 text-muted-foreground"/>
                  <span className="font-semibold text-lg">
                    {getDayLabel(schedule.day)}
                  </span>
                  <Badge variant="secondary">
                    {schedule.timeSlots.length} slot
                    {schedule.timeSlots.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {schedule.timeSlots.map((slot) => {
                    const [hours, minutes] = slot.startTime
                      .split(":")
                      .map(Number);
                    const startMinutes = hours * 60 + minutes;
                    const endMinutes = startMinutes + slot.duration;
                    const endHours = Math.floor(endMinutes / 60);
                    const endMins = endMinutes % 60;
                    const endTime = `${endHours
                      .toString()
                      .padStart(2, "0")}:${endMins
                      .toString()
                      .padStart(2, "0")}`;

                    const slotColor = slot.color || "#3b82f6";
                    const lightColor = hexToRgba(slotColor, 0.15);

                    return (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-2 rounded border"
                        style={{
                          backgroundColor: lightColor,
                          borderLeft: `4px solid ${slotColor}`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium">
                            {slot.startTime} - {endTime}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ({slot.duration} minutes)
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {slot.sessionType}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {slot.location}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit} type="button">
              <IconCheck className="h-4 w-4 mr-2"/>
              Confirm & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleBuilder;
