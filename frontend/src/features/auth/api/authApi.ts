import type { AuthResult, LoginInput, RegisterInput } from "../../../shared/types/api.types";

// this file SENDS req to backend
// Why not use apiClient?
// bcz current apiClinet is designed for ALREADY_AUTHENTICATED APP
/*
   const token = getAuthStoredSession
 */

/**
 authApi = unauthenticated requests
 - "Get me a session"
 - login/register

 apiClient = authenticated requests
 - "Use my current session to access app data"
 - can access: getHabits, createHabit, saveLog, getStreak

*/

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

// Purpose: requestAuth() sends 
//1) POST /auth/register
//2) POST /auth/login
// w/o depend on stored auth state
async function requestAuth(path: string, body: LoginInput | RegisterInput): Promise<AuthEnvelope> {
  // centralize fetch request
  // send request to backend + wait
  // backend register endpoint:
  // router.post("/auth/login", loginHandler)
  // to listen for the request sent by authApi
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // PROVIDES request body (route file READS request body)⭐
    body: JSON.stringify(body),
  });

  // check if res succeed
  // backend check: business rules related error
  // frontend mainly: network/HTTP response error
  if (!response.ok) {
    // parse JSON
    const error = await response.json().catch(() => ({ detail: "Request failed." }));
    // throw errors
    throw new Error(getFriendlyAuthMessage(response, error.detail));
  }

  // get response -> parse into JSON format -> Promise (parsing takes time)
  return response.json() as Promise<AuthEnvelope>;
}

// API service/client object
// endpoint wrapper
// elsewhere can simply do: 
// 1) await authApi.login({ email, password});
// 2) await authApi.register({name, email, password});
// instead of fetch(...)
export const authApi = {
  // endpoint wrappers
  register(input: RegisterInput): Promise<AuthEnvelope> {// Promise<return AuthEnvelope when finishes>
    return requestAuth("/auth/register", input);
  },

  login(input: LoginInput): Promise<AuthEnvelope> {
    return requestAuth("/auth/login", input);
  },
};

