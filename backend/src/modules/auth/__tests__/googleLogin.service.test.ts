import assert from "node:assert/strict";
import test from "node:test";
import jwt from "jsonwebtoken";
import type { UserRow } from "../auth.repository.js";
import { loginWithGoogle } from "../auth.service.js";

const googleUser: UserRow = {
  id: "42",
  name: "Test User",
  email: "user@example.com",
  password_hash: null,
  google_sub: "google-user-1",
  created_at: new Date(0).toISOString(),
};

const verifyCredential = async () => ({
  sub: "google-user-1",
  email: "user@example.com",
  name: "Test User",
});

test("loginWithGoogle signs in an existing Google user", async () => {
  const result = await loginWithGoogle(
    { credential: "token" },
    verifyCredential,
    {
      findByGoogleSub: async () => googleUser,
      findByEmail: async () => {
        throw new Error("email lookup should not run");
      },
      createGoogleUser: async () => {
        throw new Error("user creation should not run");
      },
      linkGoogleUser: async () => {
        throw new Error("user linking should not run");
      },
    },
  );

  assert.deepEqual(result.user, {
    id: "42",
    name: "Test User",
    email: "user@example.com",
  });
  assert.equal((jwt.decode(result.token) as { userId: string }).userId, "42");
});

test("loginWithGoogle creates a new user from the verified identity", async () => {
  let receivedInput: { name: string; email: string; googleSub: string } | undefined;

  const result = await loginWithGoogle(
    { credential: "token" },
    verifyCredential,
    {
      findByGoogleSub: async () => null,
      findByEmail: async () => null,
      createGoogleUser: async (input) => {
        receivedInput = input;
        return googleUser;
      },
      linkGoogleUser: async () => {
        throw new Error("user linking should not run");
      },
    },
  );

  assert.deepEqual(receivedInput, {
    name: "Test User",
    email: "user@example.com",
    googleSub: "google-user-1",
  });
  assert.equal(result.user.id, "42");
});

test("loginWithGoogle links a verified Google identity to an existing password account", async () => {
  let linkInput: { userId: string; googleSub: string } | undefined;

  const result = await loginWithGoogle(
    { credential: "token" },
    verifyCredential,
    {
      findByGoogleSub: async () => null,
      findByEmail: async () => ({ ...googleUser, google_sub: null }),
      createGoogleUser: async () => {
        throw new Error("user creation should not run");
      },
      linkGoogleUser: async (input) => {
        linkInput = input;
        return googleUser;
      },
    },
  );

  assert.deepEqual(linkInput, {
    userId: "42",
    googleSub: "google-user-1",
  });
  assert.equal(result.user.id, "42");
});
