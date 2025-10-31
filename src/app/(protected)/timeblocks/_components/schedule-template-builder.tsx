"use client";

import { useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IconPlus,
  IconTrash,
  IconClock,
  IconCalendar,
  IconTemplate,
  IconCheck,
  IconEdit,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { createSchedule } from "@/actions/timeblocks";

interface TimeSlot {
  id: string;
  startTime: string;
  duration: number;
  sessionType: string;
  location: string;
  description?: string;
}

interface DaySchedule {
  day: number;
  timeSlots: TimeSlot[];
}

export function ScheduleTemplateBuilder() {
  const [savedDaySchedules, setSavedDaySchedules] = useState<DaySchedule[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [currentTimeSlots, setCurrentTimeSlots] = useState<TimeSlot[]>([]);
  const [collapsedSlots, setCollapsedSlots] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysOfWeek = [
    { value: 1, label: "Monday", short: "Mon" },
    { value: 2, label: "Tuesday", short: "Tue" },
    { value: 3, label: "Wednesday", short: "Wed" },
    { value: 4, label: "Thursday", short: "Thu" },
    { value: 5, label: "Friday", short: "Fri" },
    { value: 6, label: "Saturday", short: "Sat" },
    { value: 0, label: "Sunday", short: "Sun" },
  ];

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: "09:00",
      duration: 60,
      sessionType: "private",
      location: "online",
      description: "",
    };
    setCurrentTimeSlots((prev) => [...prev, newSlot]);
  };

  const updateTimeSlot = (
    slotId: string,
    field: keyof TimeSlot,
    value: string | number
  ) => {
    setCurrentTimeSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, [field]: value } : slot
      )
    );
  };

  const removeTimeSlot = (slotId: string) => {
    setCurrentTimeSlots((prev) => prev.filter((slot) => slot.id !== slotId));
  };

  const toggleSlotCollapse = (slotId: string) => {
    setCollapsedSlots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(slotId)) {
        newSet.delete(slotId);
      } else {
        newSet.add(slotId);
      }
      return newSet;
    });
  };

  const saveDayData = () => {
    if (selectedDays.length === 0) {
      toast.error("Please select at least one day");
      return;
    }

    if (currentTimeSlots.length === 0) {
      toast.error("Please add at least one time slot");
      return;
    }

    // Validate time slots
    for (const slot of currentTimeSlots) {
      if (
        !slot.startTime ||
        !slot.duration ||
        !slot.sessionType ||
        !slot.location
      ) {
        toast.error("Please fill in all required fields for all time slots");
        return;
      }
    }

    // Save time slots for all selected days
    const newDaySchedules: DaySchedule[] = selectedDays.map((day) => ({
      day,
      timeSlots: [...currentTimeSlots],
    }));

    setSavedDaySchedules((prev) => [...prev, ...newDaySchedules]);

    // Clear for fresh start
    setSelectedDays([]);
    setCurrentTimeSlots([]);
    setCollapsedSlots(new Set());

    toast.success(`Saved time slots for ${selectedDays.length} day(s)`);
  };

  const removeDaySchedule = (day: number) => {
    setSavedDaySchedules((prev) =>
      prev.filter((schedule) => schedule.day !== day)
    );
  };

  const submitSchedule = async () => {
    if (savedDaySchedules.length === 0) {
      toast.error("No schedule data to submit");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createSchedule(savedDaySchedules);

      if (result?.success) {
        toast.success("Schedule saved successfully!");
        // Clear all data after successful submission
        setSavedDaySchedules([]);
        setSelectedDays([]);
        setCurrentTimeSlots([]);
        setCollapsedSlots(new Set());
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

  const getDayLabel = (dayValue: number) => {
    return (
      daysOfWeek.find((d) => d.value === dayValue)?.label || dayValue.toString()
    );
  };

  const formatTimeRange = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, "0")}:${endMins
      .toString()
      .padStart(2, "0")}`;
    return `${startTime} - ${endTime}`;
  };

  const WeeklyCalendarView = () => {
    const weekDays = [
      { value: 1, label: "Monday", short: "Mon" },
      { value: 2, label: "Tuesday", short: "Tue" },
      { value: 3, label: "Wednesday", short: "Wed" },
      { value: 4, label: "Thursday", short: "Thu" },
      { value: 5, label: "Friday", short: "Fri" },
      { value: 6, label: "Saturday", short: "Sat" },
      { value: 0, label: "Sunday", short: "Sun" },
    ];

    return (
      <div className="w-full">
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekDays.map((day) => (
            <div key={day.value} className="text-center">
              <div className="font-medium text-sm text-muted-foreground mb-2">
                {day.short}
              </div>
              <div className="min-h-[200px] border rounded-lg p-2 bg-muted/20">
                {savedDaySchedules
                  .filter((schedule) => schedule.day === day.value)
                  .map((schedule) => (
                    <div key={schedule.day} className="space-y-1">
                      {schedule.timeSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="text-xs bg-muted border border-muted-foreground rounded-lg px-2 py-1"
                        >
                          <div className="font-medium">
                            {formatTimeRange(slot.startTime, slot.duration)}
                          </div>
                          <div>
                            {slot.sessionType} • {slot.location}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                {savedDaySchedules.filter(
                  (schedule) => schedule.day === day.value
                ).length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-8">
                    No slots
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* First Card - Add Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconPlus className="h-5 w-5" />
            Add Time Slots
          </CardTitle>
          <CardDescription>
            Select days and add time slots for your schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Day Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Days</Label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <Button
                  key={day.value}
                  variant={
                    selectedDays.includes(day.value) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => toggleDay(day.value)}
                  className="text-xs"
                >
                  {day.short}
                </Button>
              ))}
            </div>
            {selectedDays.length > 0 ? (
              <div className="text-sm text-muted-foreground">
                Selected: {selectedDays.map(getDayLabel).join(", ")}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm font-medium">
                  Select days to add time slots
                </p>
              </div>
            )}
          </div>

          {/* Time Slots */}
          {selectedDays.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Time Slots{" "}
                  {selectedDays.length > 1 &&
                    `(will be added to all ${selectedDays.length} selected days)`}
                </Label>
                <Button onClick={addTimeSlot} size="sm" variant="outline">
                  <IconPlus className="h-4 w-4 mr-1" />
                  Add Slot
                </Button>
              </div>

              {currentTimeSlots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <IconClock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No time slots added yet</p>
                  <p className="text-xs">
                    Click &quot;Add Slot&quot; to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentTimeSlots.map((slot) => (
                    <Card key={slot.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-6 bg-blue-300 rounded-full" />
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              Slot {currentTimeSlots.indexOf(slot) + 1}
                            </span>
                          </div>
                          {collapsedSlots.has(slot.id) && (
                            <div className="text-sm text-muted-foreground">
                              {formatTimeRange(slot.startTime, slot.duration)} •{" "}
                              {slot.sessionType} • {slot.location}
                              {slot.description && ` • ${slot.description}`}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleSlotCollapse(slot.id)}
                          >
                            {collapsedSlots.has(slot.id) ? (
                              <IconEdit className="h-4 w-4" />
                            ) : (
                              <IconCheck className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeTimeSlot(slot.id)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {!collapsedSlots.has(slot.id) && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Start Time</Label>
                            <Input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) =>
                                updateTimeSlot(
                                  slot.id,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              className="text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">
                              Duration (minutes)
                            </Label>
                            <Input
                              type="number"
                              value={slot.duration}
                              onChange={(e) =>
                                updateTimeSlot(
                                  slot.id,
                                  "duration",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Session Type</Label>
                            <Select
                              value={slot.sessionType}
                              onValueChange={(value) =>
                                updateTimeSlot(slot.id, "sessionType", value)
                              }
                            >
                              <SelectTrigger className="text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="private">Private</SelectItem>
                                <SelectItem value="group">Group</SelectItem>
                                <SelectItem value="workshop">
                                  Workshop
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Location</Label>
                            <Select
                              value={slot.location}
                              onValueChange={(value) =>
                                updateTimeSlot(slot.id, "location", value)
                              }
                            >
                              <SelectTrigger className="text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="online">Online</SelectItem>
                                <SelectItem value="classroom">
                                  Classroom
                                </SelectItem>
                                <SelectItem value="studio">Studio</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">
                              Description (optional)
                            </Label>
                            <Textarea
                              value={slot.description || ""}
                              onChange={(e) =>
                                updateTimeSlot(
                                  slot.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Add notes about this time slot..."
                              className="text-xs"
                              rows={2}
                            />
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Save Button */}
          {selectedDays.length > 0 && currentTimeSlots.length > 0 && (
            <div className="pt-4 border-t">
              <Button onClick={saveDayData} className="w-full">
                <IconCheck className="h-4 w-4 mr-2" />
                Done
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Second Card - Day Schedules Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTemplate className="h-5 w-5" />
            Day Schedules
          </CardTitle>
          <CardDescription>
            Overview of your configured day schedules
          </CardDescription>
          <CardAction>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <IconCalendar className="h-4 w-4 mr-2" />
                    Preview Calendar
                  </Button>
                </DialogTrigger>
                <DialogContent
                  showCloseButton={false}
                  className="!max-w-6xl !max-h-[80vh] overflow-y-auto"
                >
                  <DialogHeader>
                    <DialogTitle>Weekly Schedule Preview</DialogTitle>
                    <DialogDescription>
                      View your configured time slots in a weekly calendar
                      format
                    </DialogDescription>
                  </DialogHeader>
                  <WeeklyCalendarView />
                </DialogContent>
              </Dialog>

              <Button
                onClick={submitSchedule}
                disabled={savedDaySchedules.length === 0 || isSubmitting}
                size="sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <IconCheck className="h-4 w-4 mr-2" />
                    Submit Schedule
                  </>
                )}
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          {savedDaySchedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <IconCalendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No day schedules configured yet</p>
              <p className="text-xs">
                Add time slots in the left panel to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedDaySchedules.map((schedule) => (
                <Card key={schedule.day} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col gap-2 w-full overflow-hidden">
                      <div className="flex items-center gap-2">
                        <IconCalendar className="h-4 w-4" />
                        <span className="font-medium">
                          {getDayLabel(schedule.day)}
                        </span>
                        <Badge variant="secondary">
                          {schedule.timeSlots.length} slots
                        </Badge>
                      </div>
                      <div className="flex flex-row no-wrap gap-2">
                        {schedule.timeSlots.map((slot, index) => (
                          <div
                            key={slot.id}
                            className="text-sm text-muted-foreground flex items-center gap-2 whitespace-nowrap"
                          >
                            <span>
                              {formatTimeRange(slot.startTime, slot.duration)}
                            </span>
                            {index !== schedule.timeSlots.length - 1 && (
                              <span>|</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeDaySchedule(schedule.day)}
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
