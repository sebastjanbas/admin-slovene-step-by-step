/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import db from "@/db";
import {schedulesTable, timeblocksTable, tutorsTable, regularInvitationsTable} from "@/db/schema";
import {auth, clerkClient} from "@clerk/nextjs/server";
import {eq, desc, and} from "drizzle-orm";
import {randomUUID} from "crypto";
import {resend} from "@/lib/resend";
import {InvitationEmail} from "@/emails/invitation-email";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3001";
}

export const createSchedule = async (data: any) => {
  const {userId} = await auth();
  if (!userId) {
    return {success: false, error: "Unauthorized"};
  }

  if (!data) {
    return {success: false, error: "No data provided"};
  }

  try {
    // Check if a schedule already exists for this user
    const existingSchedule = await db
      .select({
        id: schedulesTable.id,
      })
      .from(schedulesTable)
      .where(eq(schedulesTable.ownerId, userId))
      .limit(1);

    if (existingSchedule.length > 0) {
      // Update existing schedule
      await db
        .update(schedulesTable)
        .set({
          schedule: data,
          updatedAt: new Date(),
        })
        .where(eq(schedulesTable.ownerId, userId));
    } else {
      // Create a new schedule
      await db.insert(schedulesTable).values({
        ownerId: userId,
        schedule: data,
      });
    }

    // Process regulars invitations
    await processRegularsInvitations(userId, data);

    return {success: true, message: "Schedule saved successfully"};
  } catch (error) {
    console.error(error);
    return {success: false, message: "Failed to save schedule"};
  }
};

async function processRegularsInvitations(userId: string, daySchedules: any[]) {
  // Get tutor info
  const tutors = await db
    .select({id: tutorsTable.id, name: tutorsTable.name})
    .from(tutorsTable)
    .where(eq(tutorsTable.clerkId, userId))
    .limit(1);

  if (tutors.length === 0) return;

  const tutor = tutors[0];
  const baseUrl = getBaseUrl();

  for (const daySchedule of daySchedules) {
    const day = daySchedule.day as number;
    const timeSlots = daySchedule.timeSlots as any[];

    for (const slot of timeSlots) {
      if (slot.sessionType !== "regulars" || !slot.email || !slot.studentClerkId) continue;

      const studentEmail = slot.email as string;
      const studentClerkId = slot.studentClerkId as string;

      // Check if invitation already exists for this tutor + email + day + time
      const existing = await db
        .select({id: regularInvitationsTable.id})
        .from(regularInvitationsTable)
        .where(
          and(
            eq(regularInvitationsTable.tutorId, tutor.id),
            eq(regularInvitationsTable.studentEmail, studentEmail),
            eq(regularInvitationsTable.dayOfWeek, day),
            eq(regularInvitationsTable.startTime, slot.startTime)
          )
        )
        .limit(1);

      if (existing.length > 0) continue;

      const token = randomUUID();

      await db.insert(regularInvitationsTable).values({
        token,
        tutorId: tutor.id,
        studentEmail,
        studentClerkId,
        dayOfWeek: day,
        startTime: slot.startTime,
        duration: slot.duration,
        location: slot.location,
        description: slot.description || null,
        color: slot.color || null,
      });

      const acceptUrl = `${baseUrl}/api/invitations/${token}?action=accept`;
      const declineUrl = `${baseUrl}/api/invitations/${token}?action=decline`;

      try {
        await resend.emails.send({
          from: "Slovenščina Korak za Korakom <noreply@slovenscinakzk.com>",
          to: studentEmail,
          subject: `${tutor.name} invited you to a recurring session`,
          react: InvitationEmail({
            tutorName: tutor.name,
            dayOfWeek: day,
            startTime: slot.startTime,
            duration: slot.duration,
            location: slot.location,
            acceptUrl,
            declineUrl,
          })
        });

      } catch (emailError) {
        console.error(`Failed to send invitation email to ${studentEmail}:`, emailError);
      }
    }
  }
}

export const getStudentInfo = async (studentId: string) => {
  const {userId} = await auth();
  const client = await clerkClient();
  if (!userId) {
    return {message: "Unauthorized", status: 401};
  }
  const user = await client.users.getUser(studentId);

  if (!user) {
    return {message: "User not found", status: 404};
  }
  return {
    user: {
      name: user.fullName,
      email: user.emailAddresses[0].emailAddress,
      image: user.imageUrl,
    },
    status: 200,
  };
};

export const getScheduleData = async () => {
  const {userId} = await auth();
  if (!userId) {
    return {message: "Unauthorized", status: 401};
  }

  try {
    const data = await db
      .select({
        id: timeblocksTable.id,
        tutorId: timeblocksTable.tutorId,
        startTime: timeblocksTable.startTime,
        duration: timeblocksTable.duration,
        status: timeblocksTable.status,
        sessionType: timeblocksTable.sessionType,
        location: timeblocksTable.location,
        studentId: timeblocksTable.studentId,
      })
      .from(timeblocksTable)
      .innerJoin(tutorsTable, eq(tutorsTable.id, timeblocksTable.tutorId))
      .where(eq(tutorsTable.clerkId, userId));

    return {data: data, status: 200};
  } catch (error) {
    console.log(error);
    return {message: "Error fetching schedule data", status: 500};
  }
};

export const getUserSchedule = async () => {
  const {userId} = await auth();
  if (!userId) {
    return {message: "Unauthorized", data: null, status: 401};
  }

  try {
    const schedule = await db
      .select({
        id: schedulesTable.id,
        schedule: schedulesTable.schedule,
        createdAt: schedulesTable.createdAt,
        updatedAt: schedulesTable.updatedAt,
      })
      .from(schedulesTable)
      .where(eq(schedulesTable.ownerId, userId))
      .orderBy(desc(schedulesTable.updatedAt))
      .limit(1);

    if (schedule.length === 0) {
      return {data: null, status: 404};
    }

    return {data: schedule[0].schedule, status: 200};
  } catch (error) {
    console.error("Error fetching user schedule:", error);
    return {message: "Error fetching user schedule", data: null, status: 500};
  }
};

export const getStudents = async () => {
  const {userId} = await auth();
  if (!userId) {
    return {data: [], status: 401};
  }

  try {
    const client = await clerkClient();
    const users = await client.users.getUserList({limit: 100});

    const students = users.data.map((user) => ({
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || "Unknown",
      image: user.imageUrl,
    }));

    return {data: students, status: 200};
  } catch (error) {
    console.error("Error fetching students:", error);
    return {data: [], status: 500};
  }
};

export const getAcceptedRegulars = async () => {
  const {userId} = await auth();
  if (!userId) {
    return {data: [], status: 401};
  }

  try {
    const invitations = await db
      .select({
        id: regularInvitationsTable.id,
        tutorId: regularInvitationsTable.tutorId,
        studentEmail: regularInvitationsTable.studentEmail,
        studentClerkId: regularInvitationsTable.studentClerkId,
        dayOfWeek: regularInvitationsTable.dayOfWeek,
        startTime: regularInvitationsTable.startTime,
        duration: regularInvitationsTable.duration,
        location: regularInvitationsTable.location,
        description: regularInvitationsTable.description,
        color: regularInvitationsTable.color,
      })
      .from(regularInvitationsTable)
      .innerJoin(tutorsTable, eq(tutorsTable.id, regularInvitationsTable.tutorId))
      .where(
        and(
          eq(tutorsTable.clerkId, userId),
          eq(regularInvitationsTable.status, "accepted")
        )
      );

    return {data: invitations, status: 200};
  } catch (error) {
    console.error("Error fetching accepted regulars:", error);
    return {data: [], status: 500};
  }
};
