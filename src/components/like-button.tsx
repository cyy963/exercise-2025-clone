"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

interface LikeButtonProps {
  postId: number;
  initialLikeCount: number;
}

export function LikeButton({ postId, initialLikeCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [optimisticCount, setOptimisticCount] = useState(initialLikeCount);

  const likeMutation = useMutation({
    mutationFn: async ({ action }: { action: "like" | "unlike" }) => {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update like");
      }

      return response.json();
    },
    onMutate: async ({ action }) => {
      setLiked(action === "like");
      setOptimisticCount((prev) =>
        action === "like" ? prev + 1 : Math.max(0, prev - 1)
      );
    },
    onError: (error) => {
      console.error("Like mutation failed:", error);
      setLiked(!liked);
      setOptimisticCount(initialLikeCount);
    },
  });

  const handleClick = () => {
    const action = liked ? "unlike" : "like";

    likeMutation.mutate({
      action,
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={likeMutation.isPending}
      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors
        ${
          liked
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }
        ${likeMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <span>{liked ? "❤️" : "🤍"}</span>
      <span>{optimisticCount}</span>
      {likeMutation.isPending && <span className="animate-spin">⏳</span>}
    </button>
  );
}
