import axios from 'axios';
import API_CONFIG from './api';

// Refresh the token 2 minutes before it expires
const REFRESH_BUFFER_MS = 2 * 60 * 1000;

let refreshTimer = null;

/** Decode the JWT payload (base64url) without any external library. */
function decodeTokenPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/** Returns how many ms from now we should wait before refreshing. */
function getRefreshDelay(token) {
  const payload = decodeTokenPayload(token);
  if (!payload || !payload.exp) return null;
  const expiresAtMs = payload.exp * 1000;
  const delay = expiresAtMs - Date.now() - REFRESH_BUFFER_MS;
  return delay;
}

/** Calls the backend refresh-token endpoint and stores the new token. */
async function doRefresh() {
  const token = localStorage.getItem('accessToken');
  if (!token) return;

  try {
    const response = await axios.post(
      `${API_CONFIG.USER_BASE()}/refresh-token`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const authHeader = response.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const newToken = authHeader.substring(7);
      localStorage.setItem('accessToken', newToken);
      // Schedule the next refresh based on the new token's expiry
      scheduleRefresh(newToken);
    }
  } catch (err) {
    console.error('Silent token refresh failed:', err);
    // Do not force a logout here — let the next actual API call handle a 401
  }
}

/**
 * Schedules a silent token refresh before the given token expires.
 * Safe to call multiple times — cancels any existing timer first.
 */
export function scheduleRefresh(token) {
  cancelRefreshTimer();
  const delay = getRefreshDelay(token);

  if (delay == null) return;

  if (delay <= 0) {
    // Already within the buffer window or expired — refresh immediately
    doRefresh();
    return;
  }

  refreshTimer = setTimeout(doRefresh, delay);
}

/**
 * Cancels any pending refresh timer (call on logout).
 */
export function cancelRefreshTimer() {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

/**
 * Call on Dashboard mount (handles page refreshes mid-session).
 * Reads the stored token and schedules a refresh based on its remaining lifetime.
 */
export function initRefreshOnLoad() {
  const token = localStorage.getItem('accessToken');
  if (token) {
    scheduleRefresh(token);
  }
}
