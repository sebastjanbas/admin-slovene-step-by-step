import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

type CalendarControlsProps = {
  calendarTitle: string;
  setShowWeekends: (showWeekends: boolean) => void;
  goToPrev: () => void;
  goToNext: () => void;
  goToToday: () => void;
  isViewDropdownOpen: boolean;
  setIsViewDropdownOpen: (isViewDropdownOpen: boolean) => void;
  currentView: string;
  changeView: (view: string) => void;
  showWeekends: boolean;
};

export const CalendarControls = (props: CalendarControlsProps) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4 items-center">
      <div className="flex items-center gap-2">
        <h2 className="text-4xl tracking-tighter font-semibold">
          {props.calendarTitle}
        </h2>
      </div>

      <div className="flex items-center gap-2 ml-auto mr-4">
        <Button onClick={props.goToToday} variant="outline" size="sm">
          Today
        </Button>

        <Button onClick={props.goToPrev} variant="outline" size="sm">
          <IconChevronLeft className="h-4 w-4" />
        </Button>

        <DropdownMenu
          open={props.isViewDropdownOpen}
          onOpenChange={props.setIsViewDropdownOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-32 justify-between">
              {props.currentView === "dayGridMonth" && "Month"}
              {props.currentView === "timeGridWeek" && "Week"}
              {props.currentView === "timeGridDay" && "Day"}
              {props.currentView === "timeGrid2Day" && "2 Days"}
              {props.currentView === "timeGrid3Day" && "3 Days"}
              {props.currentView === "listWeek" && "List"}
              <IconChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuItem onSelect={() => props.changeView("timeGridDay")}>
              Day
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => props.changeView("timeGridWeek")}>
              Week
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => props.changeView("dayGridMonth")}>
              Month
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Number of Days</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      props.changeView("timeGrid2Day");
                      props.setIsViewDropdownOpen(false);
                    }}
                  >
                    2 Days
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      props.changeView("timeGrid3Day");
                      props.setIsViewDropdownOpen(false);
                    }}
                  >
                    3 Days
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>View Options</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuCheckboxItem
                    checked={props.showWeekends}
                    onCheckedChange={props.setShowWeekends}
                  >
                    Weekends
                  </DropdownMenuCheckboxItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={props.goToNext} variant="outline" size="sm">
          <IconChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
