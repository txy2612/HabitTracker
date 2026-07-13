import type { AuthResult, LoginInput, RegisterInput } from "../../shared/types/api.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

type AuthEnvelope = {
  message: string;
  data: AuthResult;
};

function getFriendlyAuthMessage(response: Response, fallbackMessage?: string) {
  if (fallbackMessage && response.status < 500) {
    return fallbackMessage;
  }

  if (response.status === 503) {
    return "Sign in is temporarily unavailable. Please try again in a moment.";
  }

  if (response.status >= 500) {
    return "Something went wrong while signing you in. Please try again.";
  }

  return fallbackMessage ?? "Request failed. Please try again.";
}

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
    throw new Error(getFriendlyAuthMessage(response, error.detail));
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
