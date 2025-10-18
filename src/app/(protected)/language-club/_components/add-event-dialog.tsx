import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { IconPlus } from "@tabler/icons-react";
import React, { useState } from "react";
import AddEventForm from "./add-event-form";

const AddEventDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <IconPlus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="!max-w-lg bg-white dark:bg-background">
        <DialogHeader>
          <DialogTitle className="text-center">Add Event</DialogTitle>
          <DialogDescription className="text-center">
            Add a new event to the language club.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full">
          <AddEventForm setIsOpen={setIsOpen} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventDialog;
