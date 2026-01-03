type SessionState = {
    accessToken?: string;
};

let memorySession: SessionState = {};

export const getAccessToken = () => memorySession.accessToken ?? null;

export const setAccessToken = (accessToken: string) => {
    memorySession.accessToken = accessToken;
};

export const clearSession = () => {
    memorySession = {};
};

export const setSessionFromLogin = (data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const payload = data as { access_token?: string };

    if (!payload.access_token) {
        return;
    }

    setAccessToken(payload.access_token);
};

export const setSessionFromRefresh = (data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const payload = data as { access_token?: string };

    if (payload.access_token) {
        setAccessToken(payload.access_token);
    }
};
