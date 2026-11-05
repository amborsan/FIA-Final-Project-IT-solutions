// A small error class so controllers can throw clear HTTP errors.
export class AppError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Wrap async handlers so throwing/rejecting reaches the error middleware. */
export function asyncHandler(
  handler: (req: any, res: any, next: any) => Promise<unknown>,
) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
