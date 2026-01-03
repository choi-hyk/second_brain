import { useEffect, useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { getAccessToken } from '../auth/session';
import { Container } from '../components/Container';
import { useMeQuery, useRefreshTokenMutation } from '../hooks/useAuth';
import { AuthHeader } from '../components/AuthHeader';
import { ProfileMenu } from '../components/ProfileMenu';
import { LoadingPage } from '../pages/LoadingPage';

const FALLBACK_PROFILE_NAME = 'HippoBox';

const resolveProfileName = (value: unknown) =>
    typeof value === 'string' && value.trim() ? value.trim() : FALLBACK_PROFILE_NAME;

const resolveProfileInitial = (name: string) => {
    const [initial] = Array.from(name.trim());
    return initial ? initial.toUpperCase() : 'H';
};

export const AppLayout = () => {
    const token = getAccessToken();
    const {
        mutate: refreshSession,
        isIdle: isRefreshIdle,
        isPending: isRefreshPending,
        isError: isRefreshError,
    } = useRefreshTokenMutation();
    const {
        data: me,
        isPending: isMePending,
        isError: isMeError,
    } = useMeQuery({
        enabled: !!token,
    });
    const profileName = resolveProfileName((me as { name?: unknown } | undefined)?.name);
    const profileInitial = useMemo(() => resolveProfileInitial(profileName), [profileName]);
    const avatarUrl = (me as { avatar_url?: unknown } | undefined)?.avatar_url;
    const resolvedAvatarUrl =
        typeof avatarUrl === 'string' && avatarUrl.trim() ? avatarUrl : undefined;

    useEffect(() => {
        if (!token && isRefreshIdle) {
            refreshSession();
        }
    }, [isRefreshIdle, refreshSession, token]);

    if (!token && isRefreshPending) {
        return <LoadingPage />;
    }

    if (!token && isRefreshError) {
        return <Navigate to="/" replace />;
    }

    if (token && isMePending) {
        return <LoadingPage />;
    }

    if (token && isMeError) {
        return <Navigate to="/" replace />;
    }

    return (
        <Container
            outerClassName="overflow-visible"
            className="flex-col items-stretch justify-start gap-10 pt-6 pb-8 min-h-0"
        >
            <nav className="sticky top-6 z-20 flex w-full items-center justify-between rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/90 px-6 py-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur">
                <AuthHeader size="sm" layout="inline" className="shrink-0" />
                <ProfileMenu
                    profileName={profileName}
                    profileInitial={profileInitial}
                    avatarUrl={resolvedAvatarUrl}
                />
            </nav>
            <div className="flex-1">
                <Outlet />
            </div>
        </Container>
    );
};
