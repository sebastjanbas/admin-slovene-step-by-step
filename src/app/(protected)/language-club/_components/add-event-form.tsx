"use client";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  IconLanguage,
  IconMapPin,
  IconStopwatch,
  IconUsers,
} from "@tabler/icons-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { addEvent, editEvent } from "@/actions/language-club";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toZonedTime } from "date-fns-tz";
import { Booking } from "../booking/_components/bookings";

export const eventSchema = z.object({
  theme: z.string().min(2, {
    message: "Theme must be at least 2 characters.",
  }),
  tutor: z.string().min(2, {
    message: "Tutor must be at least 2 characters.",
  }),
  date: z.string().min(1, {
    message: "Date is required.",
  }),
  time: z.string().min(1, {
    message: "Time is required.",
  }),
  description: z.string().min(1, {
    message: "Description is required.",
  }),
  price: z.string().min(1, {
    message: "Price is required.",
  }),
  level: z.string().min(1, {
    message: "Level is required.",
  }),
  duration: z.string().min(1, {
    message: "Duration is required.",
  }),
  spots: z.string().min(1, {
    message: "Spots is required.",
  }),
  location: z.string().min(1, {
    message: "Location is required.",
  }),
});

const AddEventForm = ({
  setIsOpen,
  booking,
}: {
  setIsOpen: (isOpen: boolean) => void;
  booking?: Booking | null;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      theme: booking?.theme || "Event Theme",
      tutor: booking?.tutor || "Tutor Name",
      date: booking ? new Date(booking.date).toISOString() : "",
      time: booking ? new Date(booking.date).toISOString() : "",
      description: booking?.description || "Event description goes here...",
      price: booking?.price.toString() || "25.00",
      level: booking?.level || "A1",
      duration: booking?.duration?.toString() || "60",
      spots: booking?.maxBooked?.toString() || "10",
      location: booking?.location || "Ljubljana",
    },
  });

  const handleDoubleClick = (fieldName: string) => {
    setEditingField(fieldName);
  };

  const handleInputBlur = () => {
    setEditingField(null);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setEditingField(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof eventSchema>) => {
    setIsLoading(true);
    const response = booking
      ? await editEvent(values, booking.id)
      : await addEvent(values);
    if (response.success) {
      toast.success(response.message);
      router.refresh();
      setIsOpen(false);
    } else {
      toast.error(response.message);
    }
    setIsLoading(false);
  };

  const renderEditableField = (
    fieldName: keyof z.infer<typeof eventSchema>,
    displayValue: string,
    placeholder: string,
    type: string = "text"
  ) => {
    const isEditingThisField = editingField === fieldName;

    if (isEditingThisField) {
      return (
        <FormField
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input
                  {...field}
                  type={type}
                  placeholder={placeholder}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  autoFocus
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    return (
      <div
        onDoubleClick={() => handleDoubleClick(fieldName)}
        className="cursor-pointer hover:bg-muted/50 p-1 rounded-lg transition-colors"
      >
        {displayValue || placeholder}
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full h-fit">
          <CardHeader>
            <CardTitle>
              {renderEditableField("theme", form.watch("theme"), "Event Theme")}
            </CardTitle>
            <CardDescription>
              {renderEditableField("tutor", form.watch("tutor"), "Tutor Name")}
            </CardDescription>
            <CardAction>
              <div className="flex flex-col gap-1 items-end text-foreground">
                {renderEditableField(
                  "date",
                  form.watch("date")
                    ? toZonedTime(
                        new Date(form.watch("date")),
                        "Europe/Ljubljana"
                      ).toLocaleDateString("sl-SI", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "",
                  "DD/MM/YYYY",
                  "date"
                )}
                {renderEditableField(
                  "time",
                  (() => {
                    const timeValue = form.watch("time");
                    if (!timeValue) return "";
                    // If the value is an ISO string, parse and format it
                    // If the value is already in "HH:MM" format, just show it
                    // Try to detect if it's an ISO string (contains "T")
                    if (
                      typeof timeValue === "string" &&
                      timeValue.includes("T")
                    ) {
                      // Parse as date and format as HH:MM
                      const date = new Date(timeValue);
                      // If invalid date, fallback to raw value
                      if (isNaN(date.getTime())) return timeValue;
                      return toZonedTime(
                        date,
                        "Europe/Ljubljana"
                      ).toLocaleTimeString("sl-SI", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    }
                    // If it's already in "HH:MM" format, just return it
                    return timeValue;
                  })(),
                  "HH:MM",
                  "time"
                )}
              </div>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-3">
            {renderEditableField(
              "description",
              form.watch("description"),
              "Event description..."
            )}
          </CardContent>
          <CardFooter className="w-full flex flex-col justify-center items-start gap-5">
            <div className="flex items-center justify-between w-full gap-5">
              <span className="text-[45px] font-medium flex items-center gap-2">
                <span>€</span>
                {renderEditableField(
                  "price",
                  (() => {
                    const price = form.watch("price");
                    if (!price) return "";
                    // Replace comma with dot for parsing, then format
                    const num = parseFloat(price);
                    if (isNaN(num)) return price;
                    // Always show two decimals, use comma as decimal separator
                    return num.toFixed(2).replace(".", ",");
                  })(),
                  "0,00",
                  "number"
                )}
              </span>
              <div className="flex flex-col items-center gap-3">
                <div className="flex flex-row items-center gap-3 w-full">
                  <Badge
                    onDoubleClick={() => handleDoubleClick("level")}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <IconLanguage />
                    {editingField === "level" ? (
                      <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                onBlur={handleInputBlur}
                                onKeyDown={handleInputKeyDown}
                                autoFocus
                                className="w-20 h-6 text-xs"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ) : (
                      form.watch("level") || "Level"
                    )}
                  </Badge>
                  <Badge
                    variant="outline"
                    onDoubleClick={() => handleDoubleClick("spots")}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <IconUsers />
                    {editingField === "spots" ? (
                      <FormField
                        control={form.control}
                        name="spots"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                onBlur={handleInputBlur}
                                onKeyDown={handleInputKeyDown}
                                autoFocus
                                className="w-16 h-6 text-xs"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ) : (
                      form.watch("spots") || "10"
                    )}
                  </Badge>
                  <Badge
                    variant="secondary"
                    onDoubleClick={() => handleDoubleClick("duration")}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <IconStopwatch />
                    {editingField === "duration" ? (
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                onBlur={handleInputBlur}
                                onKeyDown={handleInputKeyDown}
                                autoFocus
                                className="w-16 h-6 text-xs"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ) : (
                      form.watch("duration") || "60"
                    )}
                  </Badge>
                </div>
                <Badge
                  variant="outline"
                  className="w-full cursor-pointer hover:bg-muted/50 transition-colors"
                  onDoubleClick={() => handleDoubleClick("location")}
                >
                  <IconMapPin />
                  {editingField === "location" ? (
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              onBlur={handleInputBlur}
                              onKeyDown={handleInputKeyDown}
                              autoFocus
                              className="w-32 h-6 text-xs"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ) : (
                    form.watch("location") || "Location"
                  )}
                </Badge>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : booking ? (
                "Edit Event"
              ) : (
                "Add Event"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default AddEventForm;
