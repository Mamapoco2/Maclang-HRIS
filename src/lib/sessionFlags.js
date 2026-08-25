// src/lib/sessionFlags.js
// Plain module-level flag (not React state) so non-React code — like the
// Axios interceptor — can check it synchronously without needing context.
let sessionDisplacedFlag = false;

export function setSessionDisplacedFlag(value) {
  sessionDisplacedFlag = Boolean(value);
}

export function isSessionDisplacedFlag() {
  return sessionDisplacedFlag;
}
