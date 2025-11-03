"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {
  IconTrash,
  IconCheck,
  IconClock,
  IconUsers,
  IconMapPin,
  IconFileText,
  IconVideo,
  IconBuilding,
  IconInfoCircle,
} from "@tabler/icons-react";
import {calculateEndTime} from "@/app/(protected)/my-schedule/_components/schedule-confirm-dialog";

const SESSION_TYPE_CONFIG = {
  individual: {
    label: "Individual",
    color: "bg-blue-500",
    accentColor: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description:
      "One-on-one personalized sessions tailored to individual learning needs.",
  },
  group: {
    label: "Group",
    color: "bg-purple-500",
    accentColor: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description:
      "Interactive sessions with multiple participants for collaborative learning.",
  },
  regulars: {
    label: "Regulars",
    color: "bg-pink-500",
    accentColor: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    description:
      "Ongoing sessions for committed students with consistent scheduling.",
  },
};

const LOCATION_CONFIG = {
  online: {
    label: "Online",
    icon: IconVideo,
    description: "Virtual sessions conducted via video conference platform.",
  },
  classroom: {
    label: "Classroom",
    icon: IconBuilding,
    description: "In-person sessions held at the physical classroom location.",
  },
};

const getDefaultColorForSessionType = (sessionType: string): string => {
  const defaults: Record<string, string> = {
    individual: "#3b82f6",
    group: "#8b5cf6",
    regulars: "#ec4899",
  };
  return defaults[sessionType] || "#3b82f6";
};

interface CalendarEvent {
  id: string;
  dayOfWeek: number;
  startTime: string;
  duration: number;
  sessionType: string;
  location: string;
  description?: string;
  color: string;
}

interface ScheduleSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingEvent: CalendarEvent | null;
  selectedSlot: {
    dayOfWeek: number;
    startTime: string;
    duration: number;
  } | null;
  formData: {
    startTime: string;
    duration: number;
    sessionType: string;
    location: string;
    description: string;
    color: string;
  };
  onFormDataChange: (data: {
    startTime: string;
    duration: number;
    sessionType: string;
    location: string;
    description: string;
    color: string;
  }) => void;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
  getDayLabel: (dayValue: number) => string;
}

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours}h ${mins}m`;
};

export const ScheduleSheet: React.FC<ScheduleSheetProps> = ({
                                                              isOpen,
                                                              onOpenChange,
                                                              editingEvent,
                                                              selectedSlot,
                                                              formData,
                                                              onFormDataChange,
                                                              onSave,
                                                              onDelete,
                                                              onCancel,
                                                              getDayLabel,
                                                            }) => {
  const sessionConfig =
    SESSION_TYPE_CONFIG[
      formData.sessionType as keyof typeof SESSION_TYPE_CONFIG
      ] || SESSION_TYPE_CONFIG.individual;
  const locationConfig =
    LOCATION_CONFIG[formData.location as keyof typeof LOCATION_CONFIG] ||
    LOCATION_CONFIG.online;
  const LocationIcon = locationConfig.icon;

  const handleSessionTypeChange = (value: string) => {
    const defaultColor = getDefaultColorForSessionType(value);
    onFormDataChange({
      ...formData,
      sessionType: value,
      color: defaultColor,
    });
  };

  const endTime = selectedSlot
    ? calculateEndTime(selectedSlot.startTime, formData.duration)
    : null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 overflow-y-auto">
        {/* Header with gradient accent */}
        <div
          className={`${sessionConfig.bgColor} border-b ${sessionConfig.borderColor} px-6 pt-6 pb-5`}
        >
          <SheetHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${sessionConfig.color}`}/>
              <SheetTitle className="text-2xl font-semibold">
                {editingEvent ? "Edit Session" : "New Session"}
              </SheetTitle>
            </div>
            {selectedSlot && (
              <SheetDescription className="text-base">
                <span className="inline-flex items-center gap-4 text-foreground/70">
                  <span className="inline-flex items-center gap-1.5">
                    <IconClock className="h-4 w-4"/>
                    <span className="font-medium">
                      {getDayLabel(selectedSlot.dayOfWeek)} at{" "}
                      {selectedSlot.startTime}
                    </span>
                  </span>
                  <span className="text-foreground/50">•</span>
                  <span className="font-medium">
                    {formatTime(selectedSlot.duration)}
                  </span>
                </span>
              </SheetDescription>
            )}
          </SheetHeader>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Session Summary Card */}
          {selectedSlot && (
            <div
              className={`${sessionConfig.bgColor} ${sessionConfig.borderColor} border rounded-lg p-4 space-y-3`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground/90">
                  Session Summary
                </h3>
                <div
                  className={`w-2 h-2 rounded-full ${sessionConfig.color}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Day & Time</p>
                  <p className="font-medium">
                    {getDayLabel(selectedSlot.dayOfWeek)}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedSlot.startTime} - {endTime}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium">{formatTime(formData.duration)}</p>
                  <p className="text-muted-foreground">
                    {sessionConfig.label} Session
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-current/10">
                <LocationIcon className="h-4 w-4 text-muted-foreground"/>
                <span className="text-sm text-muted-foreground">
                  {locationConfig.label}
                </span>
              </div>
            </div>
          )}

          {/* Session Type */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <IconUsers className="h-4 w-4"/>
              Session Type
            </Label>
            <Select
              value={formData.sessionType}
              onValueChange={handleSessionTypeChange}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="group">Group</SelectItem>
                <SelectItem value="regulars">Regulars</SelectItem>
              </SelectContent>
            </Select>
            {/* Contextual Information for Session Type */}
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md border border-border/50">
              <IconInfoCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0"/>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {sessionConfig.description}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <IconMapPin className="h-4 w-4"/>
              Location
            </Label>
            <Select
              value={formData.location}
              onValueChange={(value) =>
                onFormDataChange({...formData, location: value})
              }
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">
                  <div className="flex items-center gap-2">
                    <IconVideo className="h-4 w-4"/>
                    Online
                  </div>
                </SelectItem>
                <SelectItem value="classroom">
                  <div className="flex items-center gap-2">
                    <IconBuilding className="h-4 w-4"/>
                    Classroom
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {/* Contextual Information for Location */}
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md border border-border/50">
              <IconInfoCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0"/>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locationConfig.description}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <IconFileText className="h-4 w-4"/>
              Notes{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                onFormDataChange({...formData, description: e.target.value})
              }
              placeholder="Add any additional notes or reminders for this session..."
              rows={4}
              className="resize-none text-base"
            />
            <p className="text-xs text-muted-foreground">
              Use this field to add session-specific notes, student preferences,
              or special instructions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="px-6 py-4 border-t bg-muted/30 flex flex-row justify-between gap-3">
          {editingEvent && (
            <Button
              variant="outline"
              className="border-destructive text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
              onClick={onDelete}
              type="button"
            >
              <IconTrash className="h-4 w-4 mr-2"/>
              Delete
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
            <Button onClick={onSave} type="button" variant="default">
              <IconCheck className="h-4 w-4 mr-2"/>
              Save
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
