import { db } from '@/lib/db';
import { users, posts } from '@/lib/db/schema';
import { sum } from 'drizzle-orm';

async function getTotalUsers() {
  await new Promise(resolve => setTimeout(resolve, 800));
  const userCount = await db.select().from(users);
  return userCount.length;
}

async function getTotalPosts() {
  await new Promise(resolve => setTimeout(resolve, 600));
  const postCount = await db.select().from(posts);
  return postCount.length;
}

async function getTotalLikes() {
  await new Promise(resolve => setTimeout(resolve, 400));
  const [result] = await db.select({ total: sum(posts.likeCount) }).from(posts);
  return result.total || 0;
}

export async function DashboardStats() {
  const totalUsers = await getTotalUsers();
  const totalPosts = await getTotalPosts();
  const totalLikes = await getTotalLikes();

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900">Users</h3>
        <p className="text-2xl font-bold text-blue-700">{totalUsers}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-green-900">Posts</h3>
        <p className="text-2xl font-bold text-green-700">{totalPosts}</p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-red-900">Likes</h3>
        <p className="text-2xl font-bold text-red-700">{totalLikes}</p>
      </div>
    </div>
  );
}