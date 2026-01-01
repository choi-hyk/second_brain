export type QueryValue = string | number | boolean | null | undefined;
export type Query = Record<string, QueryValue>;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getApiOrigin = () => {
    const rawOrigin = import.meta.env.VITE_API_URL?.trim() ?? '';
    return rawOrigin ? trimTrailingSlash(rawOrigin) : '';
};

const getApiBasePath = () => import.meta.env.VITE_API_BASE?.trim() || '/api/v1';

export const API_ORIGIN = getApiOrigin();
export const API_BASE_PATH = getApiBasePath();

export const API_BASE_URL = (() => {
    if (!API_ORIGIN) {
        // Dev: Vite proxy. Prod: same-origin.
        return API_BASE_PATH;
    }

    if (API_BASE_PATH.startsWith('/')) {
        return `${API_ORIGIN}${API_BASE_PATH}`;
    }

    return `${API_ORIGIN}/${API_BASE_PATH}`;
})();

const buildQuery = (query?: Query) => {
    if (!query) return '';

    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        params.set(key, String(value));
    });

    const qs = params.toString();
    return qs ? `?${qs}` : '';
};

export const buildApiUrl = (path: string, query?: Query) => {
    const normalizedBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${normalizedBase}${normalizedPath}${buildQuery(query)}`;
};

export type ApiError = {
    status: number;
    message: string;
};

export async function apiRequest<T>(
    path: string,
    options: RequestInit & { query?: Query; json?: unknown } = {},
): Promise<T> {
    const { query, json, headers, ...rest } = options;
    const finalHeaders = new Headers(headers);

    if (json !== undefined && json !== null && !finalHeaders.has('Content-Type')) {
        finalHeaders.set('Content-Type', 'application/json');
    }

    const response = await fetch(buildApiUrl(path, query), {
        ...rest,
        headers: finalHeaders,
        body: json !== undefined ? JSON.stringify(json) : rest.body,
    });

    if (!response.ok) {
        let message = response.statusText;

        try {
            const data = await response.json();
            if (typeof data?.detail === 'string') {
                message = data.detail;
            }
        } catch {
            try {
                const text = await response.text();
                if (text) message = text;
            } catch {
                // ignore
            }
        }

        const error: ApiError = { status: response.status, message };
        throw error;
    }

    if (response.status === 204) {
        return {} as T;
    }

    return (await response.json()) as T;
}
