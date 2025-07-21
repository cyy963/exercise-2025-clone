"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { updateUserSchema } from "@/lib/db/types";
import { getSession, hashPassword } from "@/lib/auth/utils";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";

const updateProfileSchema = updateUserSchema.extend({
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

export async function updateProfileAction(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Unauthorized" };
    }

    const rawData = {
      username: formData.get("username")?.toString(),
      hashedPassword: formData.get("hashedPassword")?.toString(),
      currentPassword: formData.get("currentPassword")?.toString(),
      newPassword: formData.get("newPassword")?.toString(),
    };

    const validated = updateProfileSchema.safeParse(rawData);
    if (!validated.success) {
      return { error: "Invalid input data" };
    }

    const { username, currentPassword, newPassword } = validated.data;

    const updateData: any = {};

    if (username) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser.length > 0 && existingUser[0].id !== session.userId) {
        return { error: "Username already taken" };
      }

      updateData.username = username;
    }

    if (newPassword && currentPassword) {
      const newHashedPassword = await hashPassword(newPassword);
      updateData.hashedPassword = newHashedPassword;
    }

    if (Object.keys(updateData).length > 0) {
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, session.userId));
    }

    revalidatePath("/dashboard");
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Profile update error:", error);
    return { error: "Failed to update profile" };
  }
}
