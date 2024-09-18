import { db } from '../db';
import { users } from '../schema';
import { eq } from 'drizzle-orm';

export function getUserByUsername(username: string) {
  return db
    .select({
      id: users.id,
      username: users.username,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
}

export function insertUser(data: { username: string; passwordHash: string }) {
  return db.insert(users).values(data).onConflictDoNothing().returning({
    id: users.id,
    username: users.username,
  });
}
