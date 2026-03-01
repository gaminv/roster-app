import { MESSAGES } from '../constants/messages'

/** Таймаут на один запрос (секунды 2). */
export const REQUEST_TIMEOUT_MS = 2000

/** Сколько раз повторить запрос после неудачи (всего попыток = 1 + RETRY_COUNT). */
export const RETRY_COUNT = 2

export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = REQUEST_TIMEOUT_MS, signal, ...init } = options
  const controller = new AbortController()
  let timedOut = false
  const timeoutId = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeout)

  const cleanup = () => {
    clearTimeout(timeoutId)
    signal?.removeEventListener('abort', onAbort)
  }

  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort)

  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    cleanup()
    return res
  } catch (err) {
    cleanup()
    if (timedOut) throw new Error(MESSAGES.TIMEOUT)
    throw err
  }
}

/**
 * Выполняет запрос с таймаутом 2 с и до RETRY_COUNT повторных попыток при неудаче.
 * Ошибка показывается только после исчерпания всех попыток.
 */
export async function fetchWithTimeoutAndRetry(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { signal: externalSignal, ...rest } = options
  let lastError: Error | null = null
  for (let attempt = 1; attempt <= 1 + RETRY_COUNT; attempt++) {
    if (externalSignal?.aborted) {
      throw lastError ?? new Error(MESSAGES.TIMEOUT)
    }
    const controller = new AbortController()
    const onExternalAbort = () => controller.abort()
    externalSignal?.addEventListener('abort', onExternalAbort)
    try {
      const res = await fetchWithTimeout(url, {
        ...rest,
        timeout: options.timeout ?? REQUEST_TIMEOUT_MS,
        signal: controller.signal,
      })
      externalSignal?.removeEventListener('abort', onExternalAbort)
      return res
    } catch (err) {
      externalSignal?.removeEventListener('abort', onExternalAbort)
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt === 1 + RETRY_COUNT) throw lastError
    }
  }
  throw lastError ?? new Error(MESSAGES.TIMEOUT)
}

/** Оборачивает обещание в таймаут — для fetch + json() и других долгих операций */
export function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ])
}
