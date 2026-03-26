const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const store = sessionStorage;

export const getToken = () => store.getItem(TOKEN_KEY);
export const setToken = (t) => store.setItem(TOKEN_KEY, t);
export const getUser = () => {
  try {
    const u = store.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  } catch {
    store.removeItem(USER_KEY);
    return null;
  }
};
export const setUser = (u) => store.setItem(USER_KEY, JSON.stringify(u));
export const clearAuth = () => {
  store.removeItem(TOKEN_KEY);
  store.removeItem(USER_KEY);
};
