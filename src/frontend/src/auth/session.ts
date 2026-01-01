type SessionTokens = {
    accessToken: string;
    refreshToken: string;
    userId: number;
};

const ACCESS_TOKEN_KEY = 'hippobox_access_token';
const REFRESH_TOKEN_KEY = 'hippobox_refresh_token';
const USER_ID_KEY = 'hippobox_user_id';

let memorySession: Partial<SessionTokens> = {};

const safeStorageGet = (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
};

const safeStorageSet = (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // ignore storage errors
    }
};

const safeStorageRemove = (key: string) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(key);
    } catch {
        // ignore storage errors
    }
};

const parseUserId = (value: string | null) => {
    if (!value) return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
};

export const getAccessToken = () => memorySession.accessToken ?? safeStorageGet(ACCESS_TOKEN_KEY);

export const getRefreshToken = () =>
    memorySession.refreshToken ?? safeStorageGet(REFRESH_TOKEN_KEY);

export const getUserId = () => {
    if (memorySession.userId !== undefined) return memorySession.userId;
    return parseUserId(safeStorageGet(USER_ID_KEY));
};

export const setSessionTokens = (tokens: SessionTokens) => {
    memorySession = { ...tokens };
    safeStorageSet(ACCESS_TOKEN_KEY, tokens.accessToken);
    safeStorageSet(REFRESH_TOKEN_KEY, tokens.refreshToken);
    safeStorageSet(USER_ID_KEY, String(tokens.userId));
};

export const setAccessToken = (accessToken: string) => {
    memorySession.accessToken = accessToken;
    safeStorageSet(ACCESS_TOKEN_KEY, accessToken);
};

export const setRefreshToken = (refreshToken: string) => {
    memorySession.refreshToken = refreshToken;
    safeStorageSet(REFRESH_TOKEN_KEY, refreshToken);
};

export const setUserId = (userId: number) => {
    memorySession.userId = userId;
    safeStorageSet(USER_ID_KEY, String(userId));
};

export const clearSession = () => {
    memorySession = {};
    safeStorageRemove(ACCESS_TOKEN_KEY);
    safeStorageRemove(REFRESH_TOKEN_KEY);
    safeStorageRemove(USER_ID_KEY);
};

export const setSessionFromLogin = (data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const payload = data as {
        access_token?: string;
        refresh_token?: string;
        user?: { id?: number };
    };

    if (!payload.access_token || !payload.refresh_token || typeof payload.user?.id !== 'number') {
        return;
    }

    setSessionTokens({
        accessToken: payload.access_token,
        refreshToken: payload.refresh_token,
        userId: payload.user.id,
    });
};

export const setSessionFromRefresh = (data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const payload = data as { access_token?: string; refresh_token?: string };

    if (payload.access_token) {
        setAccessToken(payload.access_token);
    }

    if (payload.refresh_token) {
        setRefreshToken(payload.refresh_token);
    }
};
