import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationOptions,
    type UseQueryOptions,
} from '@tanstack/react-query';

import { apiClient } from '../api/client';

export type ApiKeyResponse = {
    id: number;
    user_id: number;
    name: string;
    access_key: string;
    total_requests: number;
    is_active: boolean;
    last_used_at: string | null;
    created_at: string;
};

export type ApiKeyCreatedResponse = {
    id: number;
    name: string;
    access_key: string;
    secret_key: string;
    total_requests: number;
    created_at: string;
};

type QueryOptions = Omit<UseQueryOptions<ApiKeyResponse[]>, 'queryKey' | 'queryFn'>;

const unwrap = async <T>(promise: Promise<{ data?: T; error?: unknown }>) => {
    const { data, error } = await promise;
    if (error) throw error;
    return data as T;
};

export const useApiKeysQuery = (options?: QueryOptions) =>
    useQuery({
        queryKey: ['apiKeys'],
        queryFn: async () => {
            const data = await unwrap(apiClient.GET('/api/v1/api_key'));
            return [...data].sort((a, b) => {
                const aTime = new Date(a.created_at).getTime();
                const bTime = new Date(b.created_at).getTime();
                if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
                if (Number.isNaN(aTime)) return 1;
                if (Number.isNaN(bTime)) return -1;
                return bTime - aTime;
            });
        },
        staleTime: 1000 * 30,
        ...options,
    });

export const useCreateApiKeyMutation = (
    options?: UseMutationOptions<ApiKeyCreatedResponse, unknown, string>,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (name: string) => unwrap(apiClient.POST('/api/v1/api_key', { body: { name } })),
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
            options?.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
};

export const useDeleteApiKeyMutation = (options?: UseMutationOptions<unknown, unknown, number>) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (keyId: number) =>
            unwrap(
                apiClient.DELETE('/api/v1/api_key/{key_id}', {
                    params: { path: { key_id: keyId } },
                }),
            ),
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
            options?.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
};

export const useUpdateApiKeyMutation = (
    options?: UseMutationOptions<ApiKeyResponse, unknown, { keyId: number; is_active: boolean }>,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ keyId, is_active }) =>
            unwrap(
                apiClient.PATCH('/api/v1/api_key/{key_id}', {
                    params: { path: { key_id: keyId } },
                    body: { is_active },
                }),
            ),
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
            options?.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
};
