"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import db from "@/db";
import { tutorsTable, timeblocksTable } from "@/db/schema";
import { sql, asc, eq, and, lt } from "drizzle-orm";

export interface TutorHoursByType {
  tutorId: number;
  tutorName: string;
  tutorEmail: string;
  tutorColor: string;
  sessionType: string;
  totalHours: number;
  totalMinutes: number;
  sessionCount: number;
}

export const isAdmin = async () => {
  const { userId } = await auth();
  if (!userId) {
    return false;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user.privateMetadata?.isAdmin;
};

export const checkTutorActivation = async (userId: string) => {
  const client = await clerkClient();
  const response = await client.users.getUser(userId);

  return response.privateMetadata?.isActivated;
};

export const activateTutorAccount = async () => {
  const { userId } = await auth();
  const client = await clerkClient();

  if (!userId) {
    return { message: "Unauthorized", status: 401 };
  }

  const userData = await client.users.getUser(userId);
  if (!userData) {
    return { message: "User not found", status: 404 };
  }

  try {
    await db.insert(tutorsTable).values({
      name: userData.fullName || "Unknown",
      email: userData.emailAddresses[0].emailAddress,
      avatar: userData.imageUrl || "",
      phone: "Unknown",
      bio: "Unknown",
      color: "#6366f1",
      clerkId: userId,
    });

    await client.users.updateUser(userId, {
      privateMetadata: {
        isActivated: true,
      },
    });
    return { message: "Account activated", status: 200 };
  } catch (error) {
    console.error(error);
    return { message: "Error activating account", status: 500 };
  }
};

export const getAllTutorHoursByType = async () => {
  const { userId } = await auth();
  if (!userId) {
    return { message: "Unauthorized", status: 401, data: [] };
  }

  try {
    // Group timeblocks by tutor and sessionType, calculate total hours
    const results = await db
      .select({
        tutorId: tutorsTable.id,
        tutorName: tutorsTable.name,
        tutorEmail: tutorsTable.email,
        tutorColor: tutorsTable.color,
        sessionType: timeblocksTable.sessionType,
        totalMinutes: sql<number>`SUM(${timeblocksTable.duration})::int`,
        sessionCount: sql<number>`COUNT(*)::int`,
      })
      .from(timeblocksTable)
      .where(
        and(
          eq(timeblocksTable.status, "booked"),
          lt(timeblocksTable.startTime, new Date())
        )
      )
      .innerJoin(tutorsTable, eq(tutorsTable.id, timeblocksTable.tutorId))
      .groupBy(
        tutorsTable.id,
        tutorsTable.name,
        tutorsTable.email,
        tutorsTable.color,
        timeblocksTable.sessionType
      )
      .orderBy(asc(tutorsTable.name), asc(timeblocksTable.sessionType));

    // Transform the data to include total hours
    const data: TutorHoursByType[] = results.map((row) => ({
      tutorId: row.tutorId,
      tutorName: row.tutorName,
      tutorEmail: row.tutorEmail,
      tutorColor: row.tutorColor,
      sessionType: row.sessionType,
      totalHours: Number((row.totalMinutes / 60).toFixed(2)),
      totalMinutes: row.totalMinutes,
      sessionCount: row.sessionCount,
    }));

    return { message: "Success", status: 200, data };
  } catch (error) {
    console.error(error);
    return { message: "Error fetching tutor hours", status: 500, data: [] };
  }
};
