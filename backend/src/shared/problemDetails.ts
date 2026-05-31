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
  return {
    type: input.type,
    title: input.title,
    status: input.status,
    detail: input.detail,
    instance: input.instance,
    requestId: input.requestId,
    errors: input.errors,
  };
}
