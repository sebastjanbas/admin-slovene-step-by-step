"use client";

import {useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconSearch,
  IconPlus,
  IconClock,
  IconMapPin,
  IconUser,
} from "@tabler/icons-react";
import {TIMEBLOCKS, STUDENTS} from "@/components/calendar/placeholder-data";

export function TimeblockList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sessionTypeFilter, setSessionTypeFilter] = useState("all");

  const filteredTimeblocks = TIMEBLOCKS.filter((timeblock) => {
    const student = timeblock.studentId
      ? STUDENTS.find((s) => s.id === timeblock.studentId)
      : null;
    const matchesSearch =
      !searchTerm ||
      student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      timeblock.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || timeblock.status === statusFilter;
    const matchesType =
      sessionTypeFilter === "all" ||
      timeblock.sessionType === sessionTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "booked":
        return "bg-green-100 text-green-800";
      case "available":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "no-show":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Time Blocks</h2>
          <p className="text-muted-foreground">
            Manage your available teaching slots and bookings
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <IconPlus className="h-4 w-4 mr-2"/>
          Add Time Block
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <IconSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                <Input
                  placeholder="Search by student name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sessionTypeFilter}
                onValueChange={setSessionTypeFilter}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Blocks List */}
      <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
        {filteredTimeblocks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <IconClock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50"/>
              <h3 className="text-lg font-medium mb-2">No time blocks found</h3>
              <p className="text-muted-foreground">
                {searchTerm ||
                statusFilter !== "all" ||
                sessionTypeFilter !== "all"
                  ? "Try adjusting your filters to see more results"
                  : "Create your first time block to get started"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTimeblocks.map((timeblock) => {
            const student = timeblock.studentId
              ? STUDENTS.find((s) => s.id === timeblock.studentId)
              : null;
            return (
              <Card
                key={timeblock.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              student?.color ||
                              (timeblock.status === "available"
                                ? "#3B82F6"
                                : "#6B7280"),
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {student?.name ||
                                (timeblock.status === "available"
                                  ? "Available Slot"
                                  : "Unknown Student")}
                            </h4>
                            <Badge className={getStatusColor(timeblock.status)}>
                              {timeblock.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <IconClock className="h-4 w-4"/>
                              {formatDate(timeblock.startTime)} at{" "}
                              {formatTime(timeblock.startTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <IconMapPin className="h-4 w-4"/>
                              {timeblock.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <IconUser className="h-4 w-4"/>
                              {timeblock.sessionType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{timeblock.duration} min</Badge>
                      <Button size="sm" variant="ghost">
                        {timeblock.status === "available" ? "Book" : "Edit"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
