import { lazy } from 'react';
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';

import { BASENAME } from './config-constants';

const LoginPage = lazy(() =>
    import('./pages/LoginPage').then((mod) => ({ default: mod.LoginPage })),
);
const SignupPage = lazy(() =>
    import('./pages/SignupPage').then((mod) => ({ default: mod.SignupPage })),
);
const ForgotPasswordPage = lazy(() =>
    import('./pages/ForgotPasswordPage').then((mod) => ({ default: mod.ForgotPasswordPage })),
);

const normalizeRouterBasename = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === '/') {
        return '/';
    }
    const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return withLeading.replace(/\/+$/, '') || '/';
};

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot" element={<ForgotPasswordPage />} />
        </>,
    ),
    { basename: normalizeRouterBasename(BASENAME) },
);

export default router;
