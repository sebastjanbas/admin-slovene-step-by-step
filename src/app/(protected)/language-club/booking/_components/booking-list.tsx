"use client";
import { getPeopleBooked } from "@/actions/language-club";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

type User = {
  userId: string;
  coverImage: string;
  name: string | null;
  email: string;
  status: string;
};

const BookingList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const bookingId = useSearchParams().get("id");

  useEffect(() => {
    if (!bookingId) {
      setUsers([]);
      return;
    }
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const users = await getPeopleBooked(Number(bookingId));
        setUsers(users);
      } catch (error) {
        console.error(error);
        setUsers([]);
      }
      setLoading(false);
    };
    fetchUsers();
  }, [bookingId]);

  if (!bookingId) {
    return (
      <div className="w-full flex justify-center items-center mt-4 text-gray-500">
        <span>Select a booking to see the list of people booked.</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-6">
      <h2 className="text-lg font-semibold mb-3 text-center">People Booked</h2>
      {loading ? (
        <ul className="flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, idx: number) => (
            <li
              key={idx}
              className="flex items-center px-4 py-3 border rounded-xl shadow-md border-foreground/10 gap-4"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-48" />
              </div>
            </li>
          ))}
        </ul>
      ) : users && users.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {users.map((user: User, idx: number) => (
            <li
              key={user.userId || idx}
              className="flex items-center px-4 py-3 border rounded-xl shadow-md border-foreground/10"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.coverImage} />
                <AvatarFallback>
                  {user.name?.split(" ")[0][0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <div className="font-medium">{user.name || "Unknown"}</div>
                <div className="text-sm text-muted-foreground">
                  {user.email || "No email"}
                </div>
              </div>
              <div className="text-sm text-muted-foreground ml-auto">
                <Badge
                  variant={
                    user.status === "paid"
                      ? "paid"
                      : user.status === "cancelled"
                      ? "destructive"
                      : "success"
                  }
                >
                  {user.status || "No status"}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No people have booked this event yet.
        </div>
      )}
    </div>
  );
};

export default BookingList;
