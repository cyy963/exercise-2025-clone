"use client";

import { Post } from "@/lib/db/types";
import { use } from "react";

interface PrefetchedPostsProps {
  postsPromise: Promise<Post[]>;
}

export function PrefetchedPosts({ postsPromise }: PrefetchedPostsProps) {
  const posts = use(postsPromise);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Latest Posts</h3>
      {posts.slice(0, 5).map((post) => (
        <div key={post.id} className="p-3 bg-gray-50 rounded-md">
          <h4 className="font-medium text-gray-900">{post.title}</h4>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {post.content}
          </p>
          <div className="text-xs text-gray-500 mt-2">
            {post.likeCount} likes •{" "}
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
