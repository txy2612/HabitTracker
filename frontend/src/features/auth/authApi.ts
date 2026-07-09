import type { AuthResult, LoginInput, RegisterInput } from "../../shared/types/api.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

type AuthEnvelope = {
  message: string;
  data: AuthResult;
};

async function requestAuth(path: string, body: LoginInput | RegisterInput): Promise<AuthEnvelope> {
  // centralize fetch request
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  // check if res succeed
  if (!response.ok) {
    // parse JSON
    const error = await response.json().catch(() => ({ detail: "Request failed." }));
    // throw errors
    throw new Error(error.detail ?? "Request failed.");
  }

  // get response -> parse into JSON format -> Promise (parsing takes time)
  return response.json() as Promise<AuthEnvelope>;
}

// elsewhere can simply do: 
// 1) await authApi.login({ email, password});
// 2) await authApi.register({name, email, password});
// instead of fetch(...)
export const authApi = {
  register(input: RegisterInput): Promise<AuthEnvelope> {
    return requestAuth("/auth/register", input);
  },

  login(input: LoginInput): Promise<AuthEnvelope> {
    return requestAuth("/auth/login", input);
  },
};
