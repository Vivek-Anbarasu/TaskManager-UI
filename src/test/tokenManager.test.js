import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { scheduleRefresh, cancelRefreshTimer, initRefreshOnLoad } from '../config/tokenManager.js';

vi.mock('axios');

/**
 * Build a fake JWT where exp = now + offsetMs.
 * We use small offsets so timer advances stay tiny (no OOM from fake-timer ticks).
 */
function buildFakeToken(expOffsetMs) {
  const payload = { sub: 'test@example.com', exp: Math.floor((Date.now() + expOffsetMs) / 1000) };
  const encoded = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `header.${encoded}.signature`;
}

// REFRESH_BUFFER_MS in tokenManager is 2 min = 120_000ms.
// We create tokens that expire just past the buffer so the scheduled delay is tiny.
const BUFFER_MS = 2 * 60 * 1000;

describe('tokenManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    localStorage.clear();
  });

  afterEach(() => {
    cancelRefreshTimer();
    vi.useRealTimers();
  });

  it('schedules a refresh before token expiry and not before', async () => {
    // delay = BUFFER_MS + 2000 - BUFFER_MS = 2000ms
    const token = buildFakeToken(BUFFER_MS + 2000);
    localStorage.setItem('accessToken', token);
    axios.post.mockResolvedValue({ headers: { authorization: `Bearer ${buildFakeToken(BUFFER_MS + 5000)}` } });

    scheduleRefresh(token);

    await vi.advanceTimersByTimeAsync(1500);
    expect(axios.post).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(600); // total 2100ms — timer fires
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('calls refresh immediately when token is already within buffer window', async () => {
    // delay = BUFFER_MS - 1000 - BUFFER_MS = -1000ms → immediate
    const token = buildFakeToken(BUFFER_MS - 1000);
    localStorage.setItem('accessToken', token);
    axios.post.mockResolvedValue({ headers: { authorization: `Bearer ${buildFakeToken(BUFFER_MS + 5000)}` } });

    scheduleRefresh(token);
    await Promise.resolve();
    await Promise.resolve();

    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('stores the new token in localStorage after a successful refresh', async () => {
    const token = buildFakeToken(BUFFER_MS - 1000);
    localStorage.setItem('accessToken', token);

    const freshToken = buildFakeToken(BUFFER_MS + 5000);
    axios.post.mockResolvedValue({ headers: { authorization: `Bearer ${freshToken}` } });

    scheduleRefresh(token);
    await Promise.resolve();
    await Promise.resolve();

    expect(localStorage.getItem('accessToken')).toBe(freshToken);
  });

  it('does not update localStorage when the refresh API fails', async () => {
    const token = buildFakeToken(BUFFER_MS - 1000);
    localStorage.setItem('accessToken', token);
    axios.post.mockRejectedValueOnce(new Error('Network error'));

    scheduleRefresh(token);
    await Promise.resolve();
    await Promise.resolve();

    expect(localStorage.getItem('accessToken')).toBe(token);
  });

  it('cancelRefreshTimer prevents the scheduled refresh from firing', async () => {
    const token = buildFakeToken(BUFFER_MS + 2000);
    localStorage.setItem('accessToken', token);

    scheduleRefresh(token);
    cancelRefreshTimer();

    await vi.advanceTimersByTimeAsync(5000);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('initRefreshOnLoad picks up the stored token and schedules refresh', async () => {
    const token = buildFakeToken(BUFFER_MS - 1000);
    localStorage.setItem('accessToken', token);
    axios.post.mockResolvedValue({ headers: { authorization: `Bearer ${buildFakeToken(BUFFER_MS + 5000)}` } });

    initRefreshOnLoad();
    await Promise.resolve();
    await Promise.resolve();

    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('initRefreshOnLoad does nothing when no token is in localStorage', async () => {
    initRefreshOnLoad();

    await vi.advanceTimersByTimeAsync(5000);
    expect(axios.post).not.toHaveBeenCalled();
  });
});
