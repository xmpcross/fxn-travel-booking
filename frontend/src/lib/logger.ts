// Minimal structured logger — emits JSON to stdout so logs can be parsed
// downstream (e.g. piping `docker logs fxn-chisfis-frontend` into a log
// aggregator). Use this on critical paths where you want to grep + alert
// later: payment failures, order-create failures, persistence failures.

type LogLevel = "error" | "warn" | "info"

type LogFields = Record<string, unknown>

export interface LogEntry {
  ts: string
  level: LogLevel
  event: string
  [key: string]: unknown
}

function serialiseError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    const out: Record<string, unknown> = {
      message: err.message,
      name: err.name,
    }
    const stack = (err as { stack?: string }).stack
    if (stack) out.stack = stack.split("\n").slice(0, 6).join("\n")
    // Duffel SDK errors often carry .errors[] and .meta — surface them.
    const anyErr = err as {
      errors?: unknown
      meta?: unknown
      response?: { status?: number; data?: unknown }
    }
    if (anyErr.errors) out.errors = anyErr.errors
    if (anyErr.meta) out.meta = anyErr.meta
    if (anyErr.response?.status) out.responseStatus = anyErr.response.status
    return out
  }
  if (typeof err === "string") return { message: err }
  return { value: String(err) }
}

function emit(level: LogLevel, event: string, fields: LogFields = {}, err?: unknown) {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...fields,
  }
  if (err !== undefined) entry.error = serialiseError(err)
  const line = JSON.stringify(entry)
  if (level === "error") console.error(line)
  else if (level === "warn") console.warn(line)
  else console.log(line)
}

export function logError(event: string, err: unknown, fields: LogFields = {}) {
  emit("error", event, fields, err)
}

export function logWarn(event: string, fields: LogFields = {}) {
  emit("warn", event, fields)
}

export function logInfo(event: string, fields: LogFields = {}) {
  emit("info", event, fields)
}
