export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "booked":
    case "confirmed":
      return "var(--event-bg-booked)";
    case "available":
    case "free":
      return "var(--event-bg-available)";
    case "no-show":
      return "var(--event-bg-no-show)";
    case "cancelled":
      return "var(--event-bg-cancelled)";
    default:
      return "var(--event-bg-completed)";
  }
};
