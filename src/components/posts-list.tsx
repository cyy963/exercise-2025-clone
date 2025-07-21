"use client";

import { useState, useMemo } from "react";
import { LikeButton } from "./like-button";
import { Post, User } from "@/lib/db/types";

interface PostsListProps {
  posts: (Post & {
    author: User;
  })[];
}

export function PostsList({ posts }: PostsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "likes">("date");

  const processedPosts = useMemo(() => {
    let filtered = posts;

    if (searchTerm) {
      filtered = posts.filter((post) => {
        const titleMatch = post.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const contentMatch = post.content
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const authorMatch = post.author?.username
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        const complexCalculation = Array.from({ length: 1000 }, (_, i) => {
          return Math.sqrt(i * Math.PI) + Math.sin(i) + Math.cos(i);
        }).reduce((sum, val) => sum + val, 0);

        return titleMatch || contentMatch || authorMatch;
      });
    }

    if (sortBy === "likes") {
      filtered = [...filtered].sort((a, b) => b.likeCount - a.likeCount);
    } else {
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return filtered;
  }, [posts, searchTerm, sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "date" | "likes")}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="date">Sort by Date</option>
          <option value="likes">Sort by Likes</option>
        </select>
      </div>

      <div className="space-y-4">
        {processedPosts.map((post) => (
          <div key={post.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {post.title}
                </h3>
                <p className="text-gray-600 mt-2">{post.content}</p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span>By {post.author?.username || "Unknown"}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <LikeButton
                  postId={post.id}
                  initialLikeCount={post.likeCount}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
