"use server";

import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { insertPostSchema, updatePostSchema } from "@/lib/db/types";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getSession } from "../auth/utils";

export async function createPostAction(_prevState: any, formData: FormData) {
  const session = await getSession();

  if (!session) {
    return { error: "Unauthorized" };
  }

  const rawData = {
    title: formData.get("title")?.toString(),
    content: formData.get("content")?.toString(),
    authorId: session.userId,
  };

  const validated = insertPostSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: "Invalid input data" };
  }

  try {
    const [newPost] = await db
      .insert(posts)
      .values({
        title: validated.data.title,
        content: validated.data.content,
        authorId: session.userId,
        likeCount: 0,
        createdAt: new Date(),
      })
      .returning();

    revalidatePath("/dashboard");
    return { success: true, message: "Post created successfully!" };
  } catch (error) {
    console.error("Create post error:", error);
    return { error: "Failed to create post" };
  }
}

export async function updatePostAction(formData: FormData) {
  const rawData = {
    id: parseInt(formData.get("id")?.toString() || "0"),
    title: formData.get("title")?.toString(),
    content: formData.get("content")?.toString(),
    authorId: formData.get("authorId")?.toString()
      ? parseInt(formData.get("authorId")!.toString())
      : undefined,
  };

  const validated = updatePostSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: "Invalid input data", details: validated.error.issues };
  }

  const cleanUpdateData = Object.fromEntries(
    Object.entries(validated.data).filter(([, value]) => value !== undefined)
  );

  if (Object.keys(cleanUpdateData).length === 0) {
    return { error: "No fields to update" };
  }

  if (!validated.data.id || validated.data.id <= 0) {
    return { error: "Invalid post ID" };
  }

  try {
    const [updatedPost] = await db
      .update(posts)
      .set(cleanUpdateData)
      .where(eq(posts.id, validated.data.id))
      .returning();

    revalidatePath("/dashboard");
    return { success: true, post: updatedPost };
  } catch (error) {
    console.error("Update post error:", error);
    return { error: "Failed to update post" };
  }
}

export async function deletePostAction(formData: FormData) {
  const postId = formData.get("postId")?.toString();

  if (!postId || isNaN(parseInt(postId))) {
    return { error: "Invalid post ID" };
  }

  try {
    await db.delete(posts).where(eq(posts.id, parseInt(postId)));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete post error:", error);
    return { error: "Failed to delete post" };
  }
}
