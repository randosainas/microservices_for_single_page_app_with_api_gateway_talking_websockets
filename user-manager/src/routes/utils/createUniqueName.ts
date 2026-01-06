import database from '../../drizzle/databaseLauncher';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export async function createUniqueName(username: string) {
  let finalUsername = username.trim();
      let suffix = 1;

      while (true) {
        const sameName =  await database.select().from(users).where(eq(users.username, finalUsername));
        if (sameName.length === 0)
          break;
        finalUsername = `${username}${suffix++}`;
      }
	return finalUsername;
}
