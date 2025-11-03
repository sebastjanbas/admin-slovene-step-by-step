"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {
  IconCheck,
  IconCalendar,
  IconClock,
  IconVideo,
  IconBuilding,
} from "@tabler/icons-react";

interface TimeSlot {
  id: string;
  startTime: string;
  duration: number;
  sessionType: string;
  location: string;
  description?: string;
  color?: string;
}

interface DaySchedule {
  day: number;
  timeSlots: TimeSlot[];
}

const SESSION_TYPE_CONFIG = {
  private: {
    label: "Individual",
    color: "#3b82f6",
    lightColor: "rgba(59, 130, 246, 0.08)",
  },
  group: {
    label: "Group",
    color: "#8b5cf6",
    lightColor: "rgba(139, 92, 246, 0.08)",
  },
  regulars: {
    label: "Regulars",
    color: "#ec4899",
    lightColor: "rgba(236, 72, 153, 0.08)",
  },
};

const LOCATION_CONFIG = {
  online: {
    label: "Online",
    icon: IconVideo,
  },
  classroom: {
    label: "Classroom",
    icon: IconBuilding,
  },
};

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours}h ${mins}m`;
};

export const calculateEndTime = (startTime: string, duration: number): string => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60);
  const endMins = totalMinutes % 60;
  return `${endHours.toString().padStart(2, "0")}:${endMins
    .toString()
    .padStart(2, "0")}`;
};

interface ScheduleConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  daySchedules: DaySchedule[];
  totalSlots: number;
  onConfirm: () => void;
  getDayLabel: (dayValue: number) => string;
}

export const ScheduleConfirmDialog: React.FC<ScheduleConfirmDialogProps> = ({
                                                                              isOpen,
                                                                              onOpenChange,
                                                                              daySchedules,
                                                                              totalSlots,
                                                                              onConfirm,
                                                                              getDayLabel,
                                                                            }) => {
  const totalDays = daySchedules.length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-background/95 backdrop-blur-xl border-0 shadow-2xl">
        {/* Minimal Header */}
        <div className="px-8 pt-10 pb-8">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-3xl font-semibold tracking-tight">
              Review Your Schedule
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground leading-relaxed">
              You&apos;re about to create{" "}
              <span className="font-medium text-foreground">{totalSlots}</span>{" "}
              session{totalSlots !== 1 ? "s" : ""} across{" "}
              <span className="font-medium text-foreground">{totalDays}</span>{" "}
              day{totalDays !== 1 ? "s" : ""}. Please review the details below
              before confirming.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content with generous spacing */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="space-y-8">
            {daySchedules.map((schedule) => (
              <div key={schedule.day} className="space-y-4">
                {/* Day Header - Minimal */}
                <div className="flex items-center gap-3 pb-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"/>
                  <div className="flex items-center gap-3">
                    <IconCalendar className="h-5 w-5 text-muted-foreground/60"/>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {getDayLabel(schedule.day)}
                    </h3>
                    <span className="text-sm text-muted-foreground font-medium">
                      {schedule.timeSlots.length}{" "}
                      {schedule.timeSlots.length === 1 ? "session" : "sessions"}
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"/>
                </div>

                {/* Time Slots - Card Grid */}
                <div className="grid gap-3">
                  {schedule.timeSlots.map((slot) => {
                    const sessionConfig =
                      SESSION_TYPE_CONFIG[
                        slot.sessionType as keyof typeof SESSION_TYPE_CONFIG
                        ] || SESSION_TYPE_CONFIG.private;
                    const locationConfig =
                      LOCATION_CONFIG[
                        slot.location as keyof typeof LOCATION_CONFIG
                        ] || LOCATION_CONFIG.online;
                    const LocationIcon = locationConfig.icon;
                    const endTime = calculateEndTime(
                      slot.startTime,
                      slot.duration
                    );
                    const slotColor = slot.color || sessionConfig.color;

                    return (
                      <div
                        key={slot.id}
                        className="group relative rounded-2xl p-5 transition-all duration-200 hover:shadow-md"
                        style={{
                          backgroundColor: sessionConfig.lightColor,
                          border: `1px solid ${slotColor}20`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* Left: Time Info */}
                          <div className="flex items-start gap-4 flex-1">
                            <div
                              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                              style={{backgroundColor: slotColor}}
                            />
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-3">
                                <IconClock className="h-4 w-4 text-muted-foreground/70"/>
                                <span className="font-semibold text-base tracking-tight">
                                  {slot.startTime} – {endTime}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  • {formatTime(slot.duration)}
                                </span>
                              </div>
                              {slot.description && (
                                <p className="text-sm text-muted-foreground/80 leading-relaxed pt-1">
                                  {slot.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Badges */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div
                              className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm"
                              style={{
                                backgroundColor: `${slotColor}15`,
                                color: slotColor,
                              }}
                            >
                              {sessionConfig.label}
                            </div>
                            <div
                              className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-1.5"
                              style={{
                                backgroundColor: "rgba(0, 0, 0, 0.03)",
                                color: "hsl(var(--muted-foreground))",
                              }}
                            >
                              <LocationIcon className="h-3.5 w-3.5"/>
                              {locationConfig.label}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="px-8 py-6 border-t bg-muted/20 backdrop-blur-sm">
          <DialogFooter className="flex-row justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button onClick={onConfirm} type="button" variant="default">
              <IconCheck className="h-4 w-4 mr-2"/>
              Submit Schedule
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
