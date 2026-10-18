"use client";

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { ApiError } from "@/shared/api";
import { LOGIN_PATH } from "@/shared/config";

function isClientError(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 400 && error.status < 500;
}

/**
 * Кэш серверных данных — только в памяти вкладки: ничего личного не пишем в localStorage (ТЗ-1 §4.3).
 * netschool закрыл сессию → полная перезагрузка на экран входа, заодно очищается кэш.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (error instanceof ApiError && error.needLogin) {
              window.location.replace(LOGIN_PATH);
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 5 * 60_000,
            gcTime: 30 * 60_000,
            refetchOnWindowFocus: false,
            // Сервер сам повторяет запрос к netschool; здесь — один повтор на сбой сети или 5xx.
            retry: (failureCount, error) =>
              !isClientError(error) && failureCount < 1,
          },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
