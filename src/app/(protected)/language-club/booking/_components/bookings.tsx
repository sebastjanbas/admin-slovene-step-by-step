/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getBookingById, getBookingByTheme } from "@/actions/language-club";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconBrush,
  IconCalendar,
  IconClock,
  IconLanguage,
  IconMapPin,
  IconMoneybag,
  IconSearch,
  IconUser,
  IconUsers,
  IconWorldPin,
} from "@tabler/icons-react";
import { toZonedTime } from "date-fns-tz";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define the type for the booking based on the schema
export type Booking = {
  id: number;
  tutor: string;
  date: Date | string;
  theme: string;
  description?: string | null;
  level?: string | null;
  location: string;
  peopleBooked: number;
  maxBooked: number;
  duration?: number | null;
  price: string | number;
  stripeProductId?: string | null;
  stripePriceId?: string | null;
};

const Bookings = () => {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      setBookings([]);
      setLoading(false);
      return;
    }
    const fetchBooking = async () => {
      try {
        const result = await getBookingById(Number(bookingId));
        setBooking(result as Booking);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching booking:", error);
        toast.error("Error fetching booking");
      }
    };
    fetchBooking();
  }, [bookingId]);

  // Update the search params when the form is submitted
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      toast.error("Please enter a booking theme");
      return;
    }

    try {
      setLoading(true);
      const response = await getBookingByTheme(inputValue.trim());
      if (response) {
        setBookings(response);
        setOpen(true);
      } else {
        toast.error("Booking not found");
      }
    } catch (error) {
      console.error("Error searching for booking:", error);
      toast.error("Error searching for booking");
    }
    setLoading(false);
  };

  return (
    <>
      <div>
        <form onSubmit={handleSubmit} className="flex gap-2 items-center mb-4">
          <Input
            type="text"
            placeholder="Enter booking theme"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="border rounded-lg px-2 py-1 max-w-xs"
            disabled={loading}
          />
          <Button type="submit" variant="outline" disabled={loading}>
            <span className="flex items-center gap-2">
              <IconSearch className="w-4 h-4" />
              Search
            </span>
          </Button>
        </form>

        {loading && (
          <div className="mt-4 text-gray-500 w-full flex justify-center items-center">
            <Loader2 className="animate-spin" />
          </div>
        )}

        {!loading && booking && (
          <>
            <Card className="w-full max-w-md mx-auto min-w-sm">
              <CardHeader className="text-center text-2xl font-medium tracking-tight">
                <CardTitle>{booking.theme}</CardTitle>
                <CardDescription>
                  <p className="text-base text-muted-foreground text-center">
                    {booking.tutor}
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-start text-sm text-muted-foreground flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground text-center mb-2">
                    {booking.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-2">
                      <p className="inline-flex items-center gap-2">
                        <IconWorldPin className="w-6 h-6 text-green-700/80 dark:text-green-500/80" />
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${booking.location}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {booking.location}
                        </a>
                      </p>
                      <p className="inline-flex items-center gap-2">
                        <IconClock className="w-6 h-6 text-red-700/80 dark:text-red-500/80" />
                        {booking.duration} min
                      </p>
                      <p className="inline-flex items-center gap-2">
                        <IconUsers className="w-6 h-6 text-indigo-700/80 dark:text-indigo-400/80" />
                        {booking.peopleBooked} / {booking.maxBooked} booked
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="inline-flex items-center gap-2">
                        <IconLanguage className="w-6 h-6 text-blue-700/80 dark:text-blue-500/80" />
                        {booking.level} level
                      </p>
                      <p className="inline-flex items-center gap-2">
                        <IconMoneybag className="w-6 h-6 text-yellow-600 dark:text-yellow-500/80" />
                        {booking.price} EUR
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <IconCalendar className="w-4 h-4" />
                  <span>
                    {toZonedTime(
                      booking.date,
                      "Europe/Ljubljana"
                    ).toLocaleDateString("sl-SI", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!loading && !booking && (
          <div className="mt-4 text-gray-500 text-center">
            {bookingId ? "No booking found" : "Search for a booking"}
          </div>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-fit min-w-[500px] !max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-center">Booking Details</DialogTitle>
            <DialogDescription className="text-center">
              {bookings.length} bookings found
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-4 justify-center overflow-y-scroll  max-h-[500px] p-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className={`w-full cursor-pointer transition-colors h-fit p-2 border rounded-lg shadow-sm ${
                  selectedEventId === booking.id
                    ? "ring-2 ring-primary"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedEventId(booking.id)}
              >
                <div className="flex flex-row items-center gap-4">
                  <p className="font-medium inline-flex items-center gap-1">
                    <IconBrush className="w-4 h-4" />
                    {booking.theme}
                  </p>
                  <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
                    <IconUser className="w-4 h-4" />
                    {booking.tutor}
                  </p>
                  <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
                    <IconCalendar className="w-4 h-4" />
                    {toZonedTime(
                      new Date(booking.date),
                      "Europe/Ljubljana"
                    ).toLocaleDateString("sl-SI", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
                    <IconMapPin className="w-4 h-4" />
                    {booking.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="flex justify-center">
            <Button
              disabled={!selectedEventId}
              onClick={() => {
                setOpen(false);
                if (selectedEventId) {
                  router.push(`/language-club/booking?id=${selectedEventId}`);
                } else {
                  toast.error("Please select an event");
                }
              }}
            >
              Select
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Bookings;
