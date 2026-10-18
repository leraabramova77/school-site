/** Ответ нашего API с данными: либо данные, либо понятная ошибка; `needLogin` — показать экран входа. */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; needLogin?: true };

/** Ошибка запроса к нашему API. `message` — текст для человека, его можно показывать на экране. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly needLogin = false,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const FALLBACK_ERROR = "Что-то пошло не так. Попробуй ещё раз.";

/** GET к нашему API: данные из `{ ok: true, data }` или `ApiError` с понятным текстом. */
export async function getApi<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      signal,
      cache: "no-store",
      headers: { accept: "application/json" },
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError("Нет связи. Проверь интернет и попробуй ещё раз.", 0);
  }
  const body = (await response.json().catch(() => null)) as ApiResult<T> | null;
  if (body?.ok) return body.data;
  throw new ApiError(
    body?.error || FALLBACK_ERROR,
    response.status,
    body?.ok === false && body.needLogin === true,
  );
}
