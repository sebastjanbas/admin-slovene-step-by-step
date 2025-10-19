/* eslint-disable @typescript-eslint/no-explicit-any */

// Remove existing placeholder columns
export const removePlaceholderColumns = () => {
  const placeholderCells = document.querySelectorAll(
    ".fc-placeholder-cell, .fc-placeholder-header"
  );
  placeholderCells.forEach((cell) => cell.remove());
};

export const addColumn = (
  headerData: {
    content: string;
  },
  getCellContent: (index: number) => string
) => {
  // First, remove any existing placeholder columns to avoid duplicates
  removePlaceholderColumns();

  // Check if calendar is mounted and rendered
  const calendarEl = document.querySelector(".fc-daygrid-body");
  const headerRow =
    document.querySelector(".fc-daygrid-header tr") ||
    document.querySelector(".fc-col-header tr") ||
    document.querySelector("thead tr");

  if (!calendarEl || !headerRow) {
    return false;
  }

  // Add header cell
  const headerCell = document.createElement("th");
  headerCell.classList.add("fc-placeholder-header");
  headerCell.textContent = headerData.content;

  // Apply inline styles with higher specificity
  headerCell.style.setProperty(
    "background-color",
    "var(--background)",
    "important"
  );

  headerRow.insertBefore(headerCell, headerRow.firstChild);

  // Add data cells
  const tableRows = document.querySelectorAll(".fc-daygrid-body tr");

  if (tableRows.length > 0) {
    tableRows.forEach((row: any, index: number) => {
      // Create a new placeholder cell
      const placeholderCell = document.createElement("td");
      placeholderCell.classList.add("fc-placeholder-cell");
      placeholderCell.textContent = getCellContent(index);

      // Insert the new placeholder cell at the beginning
      row.insertBefore(placeholderCell, row.firstChild);
    });
  }

  return true;
};

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

// Calculate ISO week number
export const getISOWeekNumber = (date: Date) => {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
};
