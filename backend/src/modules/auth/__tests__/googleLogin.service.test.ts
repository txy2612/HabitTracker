import assert from "node:assert/strict";
import test from "node:test";
import jwt from "jsonwebtoken";
import { HttpError } from "../../../shared/httpErrors.js";
import type { UserRow } from "../auth.repository.js";
import { loginWithGoogle } from "../auth.service.js";

const googleOnlyUser: UserRow = {
  id: "42",
  name: "Test User",
  email: "user@example.com",
  password_hash: null,
  google_sub: "google-user-1",
  created_at: new Date(0).toISOString(),
};

const dualMethodUser: UserRow = {
  ...googleOnlyUser,
  password_hash: "stored-password-hash",
};

const passwordUser: UserRow = {
  ...dualMethodUser,
  google_sub: null,
};

const verifyCredential = async () => ({
  sub: "google-user-1",
  email: "user@example.com",
  name: "Test User",
});

function fail(message: string): never {
  throw new Error(message);
}

test("loginWithGoogle signs in an existing Google-only user without another conversion", async () => {
  const result = await loginWithGoogle(
    { credential: "token" },
    verifyCredential,
    {
      findByGoogleSub: async () => googleOnlyUser,
      findByEmail: async () => fail("email lookup should not run"),
      createGoogleUser: async () => fail("user creation should not run"),
      convertToGoogleOnlyUser: async () => fail("conversion should not run"),
    },
  );

  assert.deepEqual(result.user, {
    id: "42",
    name: "Test User",
    email: "user@example.com",
  });
  assert.equal((jwt.decode(result.token) as { userId: string }).userId, "42");
});

test("loginWithGoogle clears the password for an already-linked dual-method user", async () => {
  let conversionInput: { userId: string; googleSub: string } | undefined;

  const result = await loginWithGoogle(
    { credential: "token" },
    verifyCredential,
    {
      findByGoogleSub: async () => dualMethodUser,
      findByEmail: async () => fail("email lookup should not run"),
      createGoogleUser: async () => fail("user creation should not run"),
      convertToGoogleOnlyUser: async (input) => {
        conversionInput = input;
        return googleOnlyUser;
      },
    },
  );

  assert.deepEqual(conversionInput, {
    userId: "42",
    googleSub: "google-user-1",
  });
  assert.equal(result.user.id, "42");
});

test("loginWithGoogle creates a new Google-only user from a new verified identity", async () => {
  let receivedInput: { name: string; email: string; googleSub: string } | undefined;

  const result = await loginWithGoogle(
    { credential: "token" },
    verifyCredential,
    {
      findByGoogleSub: async () => null,
      findByEmail: async () => null,
      createGoogleUser: async (input) => {
        receivedInput = input;
        return googleOnlyUser;
      },
      convertToGoogleOnlyUser: async () => fail("conversion should not run"),
    },
  );

  assert.deepEqual(receivedInput, {
    name: "Test User",
    email: "user@example.com",
    googleSub: "google-user-1",
  });
  assert.equal(result.user.id, "42");
});

test("loginWithGoogle converts a matching password account and does not create a duplicate user", async () => {
  let conversionInput: { userId: string; googleSub: string } | undefined;

  const result = await loginWithGoogle(
    { credential: "token" },
    verifyCredential,
    {
      findByGoogleSub: async () => null,
      findByEmail: async () => passwordUser,
      createGoogleUser: async () => fail("user creation should not run after conversion"),
      convertToGoogleOnlyUser: async (input) => {
        conversionInput = input;
        return googleOnlyUser;
      },
    },
  );

  assert.deepEqual(conversionInput, {
    userId: "42",
    googleSub: "google-user-1",
  });
  assert.equal(result.user.id, "42");
});

test("loginWithGoogle rejects an email linked to a different Google identity", async () => {
  await assert.rejects(
    loginWithGoogle(
      { credential: "token" },
      verifyCredential,
      {
        findByGoogleSub: async () => null,
        findByEmail: async () => ({
          ...googleOnlyUser,
          google_sub: "different-google-user",
        }),
        createGoogleUser: async () => fail("user creation should not run"),
        convertToGoogleOnlyUser: async () => fail("conversion should not run"),
      },
    ),
    (error: unknown) =>
      error instanceof HttpError &&
      error.status === 409 &&
      error.message === "This email is connected to another Google identity.",
  );
});
