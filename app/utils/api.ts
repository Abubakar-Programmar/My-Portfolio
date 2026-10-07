interface ApiErrorBody {
  message?: string
  statusMessage?: string
  data?: { errors?: Record<string, string> }
}

interface FetchErrorLike {
  statusCode?: number
  data?: ApiErrorBody
  message?: string
}

/** Human-readable message from a failed $fetch/useFetch call. */
export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const e = err as FetchErrorLike
  return e?.data?.message || e?.data?.statusMessage || (e?.statusCode && e.statusCode < 500 ? e.message : undefined) || fallback
}

/** Per-field validation messages returned by the API (HTTP 422). */
export function fieldErrors(err: unknown): Record<string, string> {
  return (err as FetchErrorLike)?.data?.data?.errors ?? {}
}

export function errorStatus(err: unknown): number | undefined {
  return (err as FetchErrorLike)?.statusCode
}
