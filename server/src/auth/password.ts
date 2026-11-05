import { hash, verify } from "@node-rs/argon2";

// Argon2 is a modern password hashing algorithm. We never store plain passwords.
export async function hashPassword(password: string): Promise<string> {
  return hash(password);
}

export async function verifyPassword(passwordHash: string, password: string) {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}
