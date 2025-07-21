import { seed } from "drizzle-seed";
import * as schema from "./lib/db/schema";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

type Options = {
  userCount: number;
  postCount: number;
};

export async function seedDatabase(
  database: LibSQLDatabase<typeof schema>,
  opts: Options
) {
  // migrate database
  await migrate(database, { migrationsFolder: "./drizzle" });

  // @ts-ignore
  await seed(database, schema).refine((f) => ({
    users: {
      count: opts.userCount,
      with: {
        posts: opts.postCount,
      },
    },
  }));
}
