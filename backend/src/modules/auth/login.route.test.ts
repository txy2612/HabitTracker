import assert from "node:assert/strict";
import test from "node:test";
import { createTestEmail, deleteUserByEmail, withTestServer } from "./auth.test.helpers.js";

test("POST /api/auth/login returns 200 and the logged in user payload", async () => {
  const email = createTestEmail("login-success");

  await withTestServer(async (baseUrl) => {
    try {
      const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
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

      assert.equal(registerResponse.status, 201);

      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: "secret123",
        }),
      });

      assert.equal(response.status, 200);
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

      assert.equal(body.message, "Logged in successfully");
      assert.match(body.data.token, /^[^.]+\.[^.]+\.[^.]+$/);
      assert.match(body.data.user.id, /^\d+$/);
      assert.equal(body.data.user.name, "Alicia");
      assert.equal(body.data.user.email, email);
    } finally {
      await deleteUserByEmail(email);
    }
  });
});

test("POST /api/auth/login returns 401 for invalid credentials", async () => {
  const email = createTestEmail("login-invalid");

  await withTestServer(async (baseUrl) => {
    try {
      const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
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

      assert.equal(registerResponse.status, 201);

      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: "wrong-password",
        }),
      });

      assert.equal(response.status, 401);
      assert.equal(response.headers.get("content-type"), "application/problem+json; charset=utf-8");

      const body = await response.json() as {
        title: string;
        status: number;
        detail: string;
        type: string;
        instance: string;
      };

      assert.equal(body.title, "Request Error");
      assert.equal(body.status, 401);
      assert.equal(body.detail, "Invalid email or password");
      assert.equal(body.type, "about:blank");
      assert.equal(body.instance, "/api/auth/login");
    } finally {
      await deleteUserByEmail(email);
    }
  });
});

test("POST /api/auth/login returns 400 when the request body is invalid", async () => {
  await withTestServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "not-an-email",
        password: "",
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
    assert.equal(body.instance, "/api/auth/login");
    assert.deepEqual(body.errors, {
      email: ["Invalid email"],
      password: ["Password is required"],
    });
  });
});
