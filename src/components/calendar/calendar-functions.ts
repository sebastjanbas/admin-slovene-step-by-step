export const getStatusColor = (status: string, startTime: Date) => {

  switch (status?.toLowerCase()) {
    case "booked"  :
      return startTime < new Date() ? "var(--event-bg-completed)" : "var(--event-bg-booked)";
    case "available":
      return "var(--event-bg-available)";
    case "cancelled":
      return "var(--event-bg-cancelled)";
    default:
      return "var(--event-bg-completed)";
  }
};
