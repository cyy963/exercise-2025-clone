import { describe, it, expect, beforeEach, vi } from "vitest";
import { registerUser } from "../lib/workflows/registration";

const mockDb = vi.hoisted(async () => {
  const { createClient } = await import("@libsql/client");
  const { drizzle } = await import("drizzle-orm/libsql");
  const schema = await import("@/lib/db/schema");
  const { seedDatabase } = await import("@/seed");

  const client = createClient({
    url: ":memory:",
  });

  const db = drizzle(client, { schema });
  await seedDatabase(db, {
    userCount: 10,
    postCount: 10,
  });
  return db;
});

vi.mock("@/lib/db", async () => {
  return {
    db: await mockDb,
  };
});

// Mock auth utils
vi.mock("@/lib/auth/utils", () => ({
  hashPassword: vi.fn(() => Promise.resolve("hashed_password")),
}));

describe("Registration Workflows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should successfully complete the registration workflow", async () => {
      // Mock Math.random to succeed (> 0.1)
      const originalRandom = Math.random;
      Math.random = vi.fn(() => 0.5);

      try {
        const result = await registerUser("testuser", "password123");

        expect(result.success).toBe(true);
        expect(result.user.username).toBe("testuser");
        expect(result.welcomePost.title).toBe("Welcome testuser!");
        expect(result.notification.sent).toBe(true);
      } finally {
        Math.random = originalRandom;
      }
    });

    it("should handle password hashing errors", async () => {
      // Mock hashPassword to throw an error
      const mockHashPassword = await import("@/lib/auth/utils");
      vi.mocked(mockHashPassword.hashPassword).mockRejectedValueOnce(
        new Error("Hash failed")
      );

      await expect(registerUser("hashfailuser", "password123")).rejects.toThrow(
        "Failed to process password"
      );
    });

    it("should handle user creation errors", async () => {
      const originalRandom = Math.random;
      Math.random = vi.fn(() => 0.5); // Ensure notifications succeed

      try {
        // First create a user to cause duplicate username error
        await registerUser("duplicateuser", "password123");

        // Now try to create the same user - should trigger user creation error
        await expect(
          registerUser("duplicateuser", "password123")
        ).rejects.toThrow("Failed to create user account");
      } finally {
        Math.random = originalRandom;
      }
    });

    it("should handle notification errors", async () => {
      const originalRandom = Math.random;
      Math.random = vi.fn(() => 0.05); // Force notification failure

      try {
        await expect(
          registerUser("notificationfail", "password123")
        ).rejects.toThrow("Failed to send welcome notification");
      } finally {
        Math.random = originalRandom;
      }
    });
  });
});
