"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  verifyPassword,
  createJWT,
  setSessionCookie,
  clearSession,
} from "./utils";
import { eq } from "drizzle-orm";
import { registerUser } from "@/lib/workflows/registration";

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function registerAction(_prevState: any, formData: FormData) {
  const rawData = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  const validated = registerSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: "Invalid input data" };
  }

  const { username, password } = validated.data;

  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return { error: "Username already exists" };
    }

    const result = await registerUser(username, password);

    if (result.success) {
      const token = await createJWT({
        userId: result.user.id,
        username: result.user.username,
      });
      await setSessionCookie(token);
    } else {
      return { error: "Failed to create account" };
    }
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to create account" };
  }

  redirect("/dashboard");
}

export async function loginAction(_prevState: any, formData: FormData) {
  const rawData = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  const validated = loginSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: "Invalid input data" };
  }

  const { username, password } = validated.data;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return { error: "Invalid credentials" };
    }

    const isValidPassword = await verifyPassword(password, user.hashedPassword);

    if (!isValidPassword) {
      return { error: "Invalid credentials" };
    }

    const token = await createJWT({ userId: user.id, username: user.username });
    await setSessionCookie(token);
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Failed to log in" };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
