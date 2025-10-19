/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { TIMEBLOCKS } from "@/components/calendar/placeholder-data";
import { EventClickArg } from "@/components/calendar/types";
import { CalendarControls } from "@/components/calendar/calendar-controls";
import { EventSheet } from "@/components/calendar/event-sheet";
import "@/components/calendar/calendar-styles.css";
import { timeblocksTable } from "@/db/schema";
import { getStatusColor } from "./calendar-functions";

export default function Calendar() {
  const [selectedEvent, setSelectedEvent] = useState<
    typeof timeblocksTable.$inferSelect | null
  >(null);
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [calendarTitle, setCalendarTitle] = useState("Calendar");
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [showWeekends, setShowWeekends] = useState(true);
  const calendarRef = useRef<FullCalendar>(null);

  // Initialize calendar title
  useEffect(() => {
    const timer = setTimeout(() => {
      updateCalendarTitle();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const changeView = useCallback((viewName: string) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(viewName);
      setCurrentView(viewName);
      updateCalendarTitle();
    }
  }, []);

  const handleMoreEventsClick = useCallback(
    (date: Date) => {
      console.log("Clicked date:", date);

      // Find the start of the week (Monday) for the clicked date
      // FullCalendar typically uses Monday as the start of the week
      const startOfWeek = new Date(date);
      const dayOfWeek = startOfWeek.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Adjust to Monday start (if Sunday, go back 6 days; otherwise go back to Monday)
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract);

      console.log("Calculated start of week:", startOfWeek);
      console.log(
        "Day of week was:",
        dayOfWeek,
        "Days to subtract:",
        daysToSubtract
      );

      // Set the calendar to week view and navigate to that week
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        // Navigate to the specific date first
        calendarApi.gotoDate(startOfWeek);
        // Use the existing changeView function to properly update state
        changeView("timeGridWeek");
      }
    },
    [changeView]
  );

  // Handle more events clicks
  useEffect(() => {
    const handleMoreEventsClickEvent = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("fc-more-link")) {
        event.preventDefault();
        event.stopPropagation();

        // Get the date from the more link
        const dayEl = target.closest(".fc-daygrid-day");
        if (dayEl) {
          const dateStr = dayEl.getAttribute("data-date");
          console.log("Date string from element:", dateStr);
          if (dateStr) {
            // Parse the date string and create a proper Date object
            const date = new Date(dateStr + "T00:00:00");
            console.log("Parsed date:", date);
            handleMoreEventsClick(date);
          }
        }
      }
    };

    // Add event listener to the calendar container
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const calendarEl = (calendarApi as any).el;
      if (calendarEl) {
        calendarEl.addEventListener("click", handleMoreEventsClickEvent);
        return () => {
          calendarEl.removeEventListener("click", handleMoreEventsClickEvent);
        };
      }
    }
  }, [handleMoreEventsClick]);

  const handleEventClick = (arg: EventClickArg) => {
    // Convert FullCalendar event back to TutoringSession
    const session: typeof timeblocksTable.$inferSelect = {
      id: parseInt(arg.event.id),
      tutorId: arg.event.extendedProps.tutorId,
      startTime: arg.event.start!,
      duration: arg.event.extendedProps.duration,
      status: arg.event.extendedProps.status,
      sessionType: arg.event.extendedProps.sessionType,
      location: arg.event.extendedProps.location,
      studentId: arg.event.extendedProps.studentId,
    };
    setSelectedEvent(session);
    setIsEventSheetOpen(true);
  };

  const goToToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.today();
    updateCalendarTitle();
  };

  const goToPrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.prev();
    updateCalendarTitle();
  };

  const goToNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.next();
    updateCalendarTitle();
  };

  const updateCalendarTitle = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const view = calendarApi.view;
      setCalendarTitle(view.title);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0">
        <CalendarControls
          calendarTitle={calendarTitle}
          setShowWeekends={setShowWeekends}
          goToPrev={goToPrev}
          goToNext={goToNext}
          goToToday={goToToday}
          isViewDropdownOpen={isViewDropdownOpen}
          setIsViewDropdownOpen={setIsViewDropdownOpen}
          currentView={currentView}
          changeView={changeView}
          showWeekends={showWeekends}
        />
      </div>

      {/* FullCalendar Component */}
      <div className="h-[65vh] w-full">
        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
          ]}
          initialView="dayGridMonth"
          headerToolbar={false}
          height="100%"
          views={{
            timeGridWeek: {
              type: "timeGrid",
              duration: { weeks: 1 },
              buttonText: "Week",
              allDaySlot: false,
              dayHeaderFormat: { weekday: "short" },
            },
            timeGrid2Day: {
              type: "timeGrid",
              duration: { days: 2 },
              buttonText: "2 days",
              allDaySlot: false,
              dayHeaderFormat: { weekday: "long", day: "numeric" },
            },
            timeGrid3Day: {
              type: "timeGrid",
              duration: { days: 3 },
              buttonText: "3 days",
              allDaySlot: false,
              dayHeaderFormat: { weekday: "long", day: "numeric" },
            },
            timeGridDay: {
              type: "timeGrid",
              duration: { days: 1 },
              buttonText: "Day",
              allDaySlot: false,
              dayHeaderFormat: { weekday: "long", day: "numeric" },
            },
          }}
          allDaySlot={false}
          events={TIMEBLOCKS.map((timeblock) => ({
            id: timeblock.id.toString(),
            title: timeblock.sessionType,
            start: timeblock.startTime,
            end: new Date(
              timeblock.startTime.getTime() + timeblock.duration * 60000
            ),
            extendedProps: {
              status: timeblock.status,
              duration: timeblock.duration,
              sessionType: timeblock.sessionType,
              location: timeblock.location,
              studentId: timeblock.studentId,
            },
          }))}
          eventClick={handleEventClick}
          editable={true}
          selectable={false}
          selectMirror={false}
          dayMaxEvents={1}
          moreLinkClick="none"
          moreLinkContent={(arg: any) => {
            // Try different ways to get the hidden count
            const hiddenCount =
              arg.hiddenSegs?.length ||
              arg.hiddenEvents?.length ||
              arg.num ||
              0;

            if (hiddenCount > 0) {
              return `+${hiddenCount} more`;
            }

            const totalEvents = arg.allSegs?.length || 0;
            if (totalEvents > 1) {
              return `+${totalEvents - 1} more`;
            }

            return "";
          }}
          weekNumbers={false}
          weekends={showWeekends}
          firstDay={1} // Monday
          dayCellContent={(dayInfo: any) => {
            const date = new Date(dayInfo.date);
            const dayNumber = date.getDate();

            // Check if this is the first day of the month
            if (dayNumber === 1) {
              const monthName = date.toLocaleDateString("en-US", {
                month: "long",
              });
              return (
                <div>
                  <p className="inline-flex items-center gap-2">
                    <span>{monthName}</span>
                    <span>{dayNumber}</span>
                  </p>
                </div>
              );
            }

            return dayNumber;
          }}
          eventContent={(eventInfo: any) => {
            const startTime = new Date(eventInfo.event.start);
            const endTime = new Date(eventInfo.event.end);
            const timeString = `${startTime
              .getHours()
              .toString()
              .padStart(2, "0")}:${startTime
              .getMinutes()
              .toString()
              .padStart(2, "0")} - ${endTime
              .getHours()
              .toString()
              .padStart(2, "0")}:${endTime
              .getMinutes()
              .toString()
              .padStart(2, "0")}`;

            const status = eventInfo.event.extendedProps?.status;
            const statusColor = getStatusColor(status);
            return (
              <div
                className={`text-white text-sm font-medium w-full ${
                  status === "completed" ? "opacity-75" : ""
                }`}
                style={{
                  backgroundColor: statusColor,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  width: "100%",
                  height: "100%",
                  borderRadius: "6px",
                  padding: "2px 0px 0px 8px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  className="truncate capitalize font-bold"
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: "0px",
                  }}
                >
                  {eventInfo.event.extendedProps?.status}
                </div>
                <div
                  className="text-xs opacity-80 truncate"
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginTop: "0px",
                  }}
                >
                  {timeString}
                </div>
              </div>
            );
          }}
        />
      </div>

      <EventSheet
        isEventSheetOpen={isEventSheetOpen}
        setIsEventSheetOpen={setIsEventSheetOpen}
        selectedSession={selectedEvent}
      />
    </div>
  );
}
