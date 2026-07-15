export class HttpError extends Error {
  status: number;
  title?: string;
  type?: string;

  constructor(status: number, message: string, options: { title?: string; type?: string } = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.title = options.title;
    this.type = options.type;
  }
}

export type ProblemDetailsErrors = Record<string, string[]>;

export type ProblemDetailsInput = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  requestId?: string;
  errors?: ProblemDetailsErrors;
};

export type ProblemDetails = ProblemDetailsInput;

export function problemDetails(input: ProblemDetailsInput): ProblemDetails {
  return { ...input };
}
