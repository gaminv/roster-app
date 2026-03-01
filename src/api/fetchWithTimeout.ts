export const REQUEST_TIMEOUT_MS = 10000

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
    if (timedOut) {
      throw new Error(
        'Превышено время ожидания. При медленном доступе к API включите VPN. Данные из кэша сохранены.'
      )
    }
    throw err
  }
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
