/* eslint-disable @typescript-eslint/no-explicit-any */
// Types
export interface DateClickArg {
  dateStr: string;
  date: Date;
  allDay: boolean;
  dayEl: HTMLElement;
  jsEvent: MouseEvent;
  view: any;
}

export interface EventClickArg {
  event: any;
  jsEvent: MouseEvent;
  view: any;
}

export interface EventDropArg {
  event: any;
  oldEvent: any;
  delta: any;
  revert: () => void;
}

export interface EventResizeArg {
  event: any;
  startDelta: any;
  endDelta: any;
  revert: () => void;
}
