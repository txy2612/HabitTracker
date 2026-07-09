import assert from "node:assert/strict";
import test from "node:test";
import { createTestEmail, deleteUserByEmail, withTestServer } from "./auth.test.helpers.js";

test("POST /api/auth/register returns 201 and the registered user payload", async () => {
  const email = createTestEmail("register-success");

  await withTestServer(async (baseUrl) => {
    try {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Alicia",
          email,
          password: "secret123",
        }),
      });

      assert.equal(response.status, 201);
      assert.equal(response.headers.get("content-type"), "application/json; charset=utf-8");

      const body = await response.json() as {
        message: string;
        data: {
          token: string;
          user: {
            id: string;
            name: string;
            email: string;
          };
        };
      };

      assert.equal(body.message, "Registered successfully");
      assert.match(body.data.token, /^[^.]+\.[^.]+\.[^.]+$/);
      assert.match(body.data.user.id, /^\d+$/);
      assert.equal(body.data.user.name, "Alicia");
      assert.equal(body.data.user.email, email);
    } finally {
      await deleteUserByEmail(email);
    }
  });
});

test("POST /api/auth/register returns 409 when the email already exists", async () => {
  const email = createTestEmail("register-duplicate");

  await withTestServer(async (baseUrl) => {
    try {
      const firstResponse = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Alicia",
          email,
          password: "secret123",
        }),
      });

      assert.equal(firstResponse.status, 201);

      const duplicateResponse = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Another Alicia",
          email,
          password: "secret123",
        }),
      });

      assert.equal(duplicateResponse.status, 409);
      assert.equal(duplicateResponse.headers.get("content-type"), "application/problem+json; charset=utf-8");

      const body = await duplicateResponse.json() as {
        title: string;
        status: number;
        detail: string;
        instance: string;
      };

      assert.equal(body.title, "Request Error");
      assert.equal(body.status, 409);
      assert.equal(body.detail, "Email already registered");
      assert.equal(body.instance, "/api/auth/register");
    } finally {
      await deleteUserByEmail(email);
    }
  });
});

test("POST /api/auth/register returns 400 when the request body is invalid", async () => {
  await withTestServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "",
        email: "not-an-email",
        password: "123",
      }),
    });

    assert.equal(response.status, 400);
    assert.equal(response.headers.get("content-type"), "application/problem+json; charset=utf-8");

    const body = await response.json() as {
      title: string;
      status: number;
      detail: string;
      errors: Record<string, string[]>;
      instance: string;
    };

    assert.equal(body.title, "Invalid request");
    assert.equal(body.status, 400);
    assert.equal(body.detail, "The request payload, query string, or route parameters are invalid.");
    assert.equal(body.instance, "/api/auth/register");
    assert.deepEqual(body.errors, {
      name: ["Name is required"],
      email: ["Invalid email"],
      password: ["Password must be at least 6 characters"],
    });
  });
});
