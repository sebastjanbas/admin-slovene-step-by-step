export const getStatusColor = (status: string, startTime: Date, sessionType?: string) => {
  // Cancelled sessions always show red
  if (status?.toLowerCase() === "cancelled") {
    return "var(--color-red-400)";
  }

  // Color based on session type
  switch (sessionType?.toLowerCase()) {
    case "individual":
    case "group":
      return "#7475F3";
    case "regular":
      return "#3B82F6"; // Blue color for regulars
    default:
      // Fallback to purple for unknown session types
      return "#7475F3";
  }
};
