"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import AddEventForm from "./add-event-form";
import { useEditDialog } from "./edit-dialog-context";
import { getBookingById } from "@/actions/language-club";
import { Loader2 } from "lucide-react";
import { Booking } from "../booking/_components/bookings";

const EditEventDialog = () => {
  const { isOpen, closeDialog, editingEventId } = useEditDialog();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      const response = await getBookingById(editingEventId as number);
      if (!response) {
        closeDialog();
        return;
      }
      setBooking(response);
      setLoading(false);
    };
    fetchBooking();
  }, [editingEventId]);

  if (!editingEventId) return null;
  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Edit Event</DialogTitle>
          <DialogDescription className="text-center">
            Edit the event details.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px] h-full">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="w-full">
            <AddEventForm setIsOpen={closeDialog} booking={booking} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditEventDialog;
