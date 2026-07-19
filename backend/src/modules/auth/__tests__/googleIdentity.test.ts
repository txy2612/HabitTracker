import assert from "node:assert/strict";
import test from "node:test";
import { HttpError } from "../../../shared/httpErrors.js";
import { verifyGoogleCredential, type GoogleCredentialVerifier } from "../googleIdentity.js";

test("verifyGoogleCredential returns a normalized verified identity", async () => {
  const verifyIdToken: GoogleCredentialVerifier = async ({ idToken, audience }) => {
    assert.equal(idToken, "google-id-token");
    assert.equal(audience, "client-id");

    return {
      getPayload: () => ({
        sub: "google-user-1",
        email: "USER@Example.com",
        email_verified: true,
        name: "  Test User  ",
      }),
    };
  };

  const identity = await verifyGoogleCredential("google-id-token", {
    clientId: "client-id",
    verifyIdToken,
  });

  assert.deepEqual(identity, {
    sub: "google-user-1",
    email: "user@example.com",
    name: "Test User",
  });
});

test("verifyGoogleCredential rejects an unverified email", async () => {
  const verifyIdToken: GoogleCredentialVerifier = async () => ({
    getPayload: () => ({
      sub: "google-user-1",
      email: "user@example.com",
      email_verified: false,
    }),
  });

  await assert.rejects(
    verifyGoogleCredential("google-id-token", { clientId: "client-id", verifyIdToken }),
    (error: unknown) =>
      error instanceof HttpError &&
      error.status === 401 &&
      error.message === "Invalid Google credential",
  );
});

test("verifyGoogleCredential maps verifier failures to an authentication error", async () => {
  const verifyIdToken: GoogleCredentialVerifier = async () => {
    throw new Error("signature verification failed");
  };

  await assert.rejects(
    verifyGoogleCredential("bad-token", { clientId: "client-id", verifyIdToken }),
    (error: unknown) =>
      error instanceof HttpError &&
      error.status === 401 &&
      error.message === "Invalid or expired Google credential",
  );
});

test("verifyGoogleCredential reports missing Google configuration", async () => {
  await assert.rejects(
    verifyGoogleCredential("token", { clientId: "" }),
    (error: unknown) =>
      error instanceof HttpError &&
      error.status === 503 &&
      error.message === "Google Sign-In is not configured",
  );
});
