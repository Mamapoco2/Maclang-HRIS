const STORAGE_PREFIX = "login_lockout:";
const LAST_USERNAME_KEY = "login_lockout:__last_username";

function keyFor(username) {
  return `${STORAGE_PREFIX}${username.trim().toUpperCase()}`;
}

function setLastUsername(username) {
  try {
    localStorage.setItem(LAST_USERNAME_KEY, username.trim().toUpperCase());
  } catch {
    // non-critical
  }
}

function clearLastUsername() {
  try {
    localStorage.removeItem(LAST_USERNAME_KEY);
  } catch {
    // ignore
  }
}

/** The last username that had a failed attempt recorded, if any. Used to
 * restore lockout state on page load, before the user retypes anything. */
export function getLastUsername() {
  try {
    return localStorage.getItem(LAST_USERNAME_KEY);
  } catch {
    return null;
  }
}

export function getLockoutState(username) {
  if (!username) return null;
  try {
    const raw = localStorage.getItem(keyFor(username));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.attempts !== "number" ||
      typeof parsed.lockoutUntil !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null; // corrupt data or storage unavailable — fail open
  }
}

export function setLockoutState(username, state) {
  if (!username) return;
  try {
    localStorage.setItem(keyFor(username), JSON.stringify(state));
    setLastUsername(username);
  } catch {
    // private mode / quota — client throttle degrades silently, non-critical
  }
}

export function clearLockoutState(username) {
  if (!username) return;
  try {
    localStorage.removeItem(keyFor(username));
    clearLastUsername();
  } catch {
    // ignore
  }
}
