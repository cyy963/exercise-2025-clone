import { getSession } from "@/lib/auth/utils";
import { getUserWithPosts } from "@/lib/data/users";
import { getPostsWithAuthors, getAllPosts } from "@/lib/data/posts";
import { UserProfile } from "@/components/user-profile";
import { PostsList } from "@/components/posts-list";
import { DashboardStats } from "@/components/dashboard-stats";
import { PrefetchedPosts } from "@/components/prefetched-posts";
import { CreatePostForm } from "@/components/create-post-form";
import { logoutAction } from "@/lib/auth/actions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const userData = await getUserWithPosts(session.userId);
  const allPosts = await getPostsWithAuthors();
  const postsPromise = getAllPosts();

  if (!userData) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <form action={logoutAction}>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <DashboardStats />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <UserProfile user={userData} />

              <div className="mt-6 bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Demo Pages</h3>
                <div className="space-y-2">
                  <a
                    href="/performance-demo"
                    className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    Performance Demo
                  </a>
                </div>
              </div>

              <div className="mt-6 bg-white shadow rounded-lg p-6">
                <PrefetchedPosts postsPromise={postsPromise} />
              </div>
            </div>

            <div className="lg:col-span-3">
              <CreatePostForm />
              
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  All Posts
                </h2>
                <PostsList posts={allPosts} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
