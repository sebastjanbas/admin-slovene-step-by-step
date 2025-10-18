"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface EditDialogContextType {
  isOpen: boolean;
  openDialog: (eventId?: number) => void;
  closeDialog: () => void;
  editingEventId: number | null;
}

const EditDialogContext = createContext<EditDialogContextType | undefined>(
  undefined
);

export const EditDialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  const openDialog = (eventId?: number) => {
    setEditingEventId(eventId ?? null);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setEditingEventId(null);
  };

  return (
    <EditDialogContext.Provider
      value={{
        isOpen,
        openDialog,
        closeDialog,
        editingEventId,
      }}
    >
      {children}
    </EditDialogContext.Provider>
  );
};

export const useEditDialog = () => {
  const context = useContext(EditDialogContext);
  if (context === undefined) {
    throw new Error("useEditDialog must be used within an EditDialogProvider");
  }
  return context;
};
