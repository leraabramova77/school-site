// Вход и выход. Обработчики API — серверные: импортировать только из route и серверных компонентов.
export {
  type AuthResponse,
  loginHandler,
  logoutHandler,
} from "./api/auth.server";
