import { db } from "./src/lib/db";
import { seedDatabase } from "./src/seed";

async function main() {
  await seedDatabase(db, {
    userCount: 100,
    postCount: 100,
  });
}

main();
