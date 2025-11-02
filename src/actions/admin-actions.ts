"use server";

import {clerkClient} from "@clerk/nextjs/server";

export const checkTutorActivation = async (userId: string) => {
  const client = await clerkClient()
  const response = await client.users.getUser(userId);

  return response.privateMetadata?.isActivated;
}
