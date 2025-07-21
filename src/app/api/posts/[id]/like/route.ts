import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/utils";
import { eq, sql } from "drizzle-orm";

type Payload = {
  action: "like" | "unlike";
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const postId = parseInt(resolvedParams.id);

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const body: Payload = await request.json();

    if (body.action === "like") {
      await db
        .update(posts)
        .set({
          likeCount: sql`${posts.likeCount} + 1`,
          ...body,
        })
        .where(eq(posts.id, postId));
    } else {
      await db
        .update(posts)
        .set({
          likeCount: sql`CASE WHEN ${posts.likeCount} > 0 THEN ${posts.likeCount} - 1 ELSE 0 END`,
          ...body,
        })
        .where(eq(posts.id, postId));
    }

    const [updatedPost] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: `Post ${body.action}d successfully`,
    });
  } catch (error) {
    console.error("Like/unlike error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
