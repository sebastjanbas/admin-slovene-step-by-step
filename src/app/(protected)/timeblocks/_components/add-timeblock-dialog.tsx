"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconUsers,
  IconCurrencyEuro,
  IconRepeat,
  IconTemplate,
} from "@tabler/icons-react";

const timeblockSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  tutorId: z.string().min(1, "Tutor is required"),
  startDate: z.string().min(1, "Start date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  price: z.number().min(0, "Price must be positive"),
  location: z.string().min(1, "Location is required"),
  maxStudents: z.number().min(1, "Max students must be at least 1"),
  isRecurring: z.boolean().default(false),
  recurringPattern: z
    .object({
      frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
      daysOfWeek: z.array(z.number()).optional(),
      interval: z.number().min(1).optional(),
      endDate: z.string().optional(),
    })
    .optional(),
});

type TimeblockFormData = z.infer<typeof timeblockSchema>;

// Mock tutors data
const mockTutors = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    specialties: "Beginner, Intermediate",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    specialties: "Advanced, Business",
  },
  {
    id: "3",
    name: "Mark Johnson",
    email: "mark@example.com",
    specialties: "Conversation, Grammar",
  },
];

interface AddTimeblockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
}

export function AddTimeblockDialog({
  open,
  onOpenChange,
  selectedDate,
}: AddTimeblockDialogProps) {
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState({
    frequency: "weekly" as const,
    daysOfWeek: [] as number[],
    interval: 1,
    endDate: "",
  });

  const form = useForm<TimeblockFormData>({
    resolver: zodResolver(timeblockSchema),
    defaultValues: {
      title: "",
      description: "",
      tutorId: "",
      startDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      startTime: "09:00",
      endTime: "10:00",
      duration: 60,
      price: 50,
      location: "Online",
      maxStudents: 1,
      isRecurring: false,
    },
  });

  const onSubmit = (data: TimeblockFormData) => {
    console.log("Creating timeblock:", data);
    // TODO: Implement actual creation logic
    onOpenChange(false);
    form.reset();
  };

  const handleTimeChange = (field: "startTime" | "endTime", value: string) => {
    form.setValue(field, value);

    if (field === "startTime" || field === "endTime") {
      const startTime = form.getValues("startTime");
      const endTime = form.getValues("endTime");

      if (startTime && endTime) {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60);
        form.setValue("duration", Math.max(0, duration));
      }
    }
  };

  const daysOfWeek = [
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
    { value: 0, label: "Sunday" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Timeblock</DialogTitle>
          <DialogDescription>
            Create a new teaching slot that students can book.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="recurring">Recurring</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., One-on-One Session"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tutorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tutor</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tutor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockTutors.map((tutor) => (
                              <SelectItem key={tutor.id} value={tutor.id}>
                                {tutor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the session content and requirements..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            onChange={(e) =>
                              handleTimeChange("startTime", e.target.value)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            onChange={(e) =>
                              handleTimeChange("endTime", e.target.value)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Online">Online</SelectItem>
                            <SelectItem value="In-person">In-person</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxStudents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Students</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="recurring" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconRepeat className="h-5 w-5" />
                      Recurring Pattern
                    </CardTitle>
                    <CardDescription>
                      Set up recurring timeblocks for regular teaching schedules
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isRecurring"
                        checked={isRecurring}
                        onCheckedChange={setIsRecurring}
                      />
                      <label
                        htmlFor="isRecurring"
                        className="text-sm font-medium"
                      >
                        Make this a recurring timeblock
                      </label>
                    </div>

                    {isRecurring && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">
                              Frequency
                            </label>
                            <Select
                              value={recurringPattern.frequency}
                              onValueChange={(value) =>
                                setRecurringPattern((prev) => ({
                                  ...prev,
                                  frequency: value as any,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-sm font-medium">
                              Interval
                            </label>
                            <Input
                              type="number"
                              min="1"
                              value={recurringPattern.interval}
                              onChange={(e) =>
                                setRecurringPattern((prev) => ({
                                  ...prev,
                                  interval: parseInt(e.target.value) || 1,
                                }))
                              }
                            />
                          </div>
                        </div>

                        {recurringPattern.frequency === "weekly" && (
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Days of Week
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {daysOfWeek.map((day) => (
                                <Badge
                                  key={day.value}
                                  variant={
                                    recurringPattern.daysOfWeek.includes(
                                      day.value
                                    )
                                      ? "default"
                                      : "outline"
                                  }
                                  className="cursor-pointer"
                                  onClick={() => {
                                    const newDays =
                                      recurringPattern.daysOfWeek.includes(
                                        day.value
                                      )
                                        ? recurringPattern.daysOfWeek.filter(
                                            (d) => d !== day.value
                                          )
                                        : [
                                            ...recurringPattern.daysOfWeek,
                                            day.value,
                                          ];
                                    setRecurringPattern((prev) => ({
                                      ...prev,
                                      daysOfWeek: newDays,
                                    }));
                                  }}
                                >
                                  {day.label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium">
                            End Date (Optional)
                          </label>
                          <Input
                            type="date"
                            value={recurringPattern.endDate}
                            onChange={(e) =>
                              setRecurringPattern((prev) => ({
                                ...prev,
                                endDate: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Timeblock</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
