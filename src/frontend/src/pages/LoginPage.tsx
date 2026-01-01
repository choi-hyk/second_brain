import { useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Container } from '../components/Container';
import { ErrorMessage } from '../components/ErrorMessage';
import { Input } from '../components/Input';
import { AuthHeader } from '../components/AuthHeader';
import { useLoginMutation } from '../hooks/useAuth';
import { isValidEmail, isValidPassword } from '../utils/validation';

type FormErrorKey = '' | 'requiredEmail' | 'invalidEmail' | 'requiredPassword' | 'invalidPassword';

export function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState(() => searchParams.get('email') ?? '');
    const [password, setPassword] = useState('');
    const [formErrorKey, setFormErrorKey] = useState<FormErrorKey>('');

    const loginMutation = useLoginMutation({
        onSuccess: () => {
            navigate('/app');
        },
    });

    const apiErrorMessage = useMemo(() => {
        if (!loginMutation.error) return '';
        if (loginMutation.error instanceof Error && loginMutation.error.message) {
            return loginMutation.error.message;
        }
        return t('login.errorFallback');
    }, [loginMutation.error, t]);

    const formErrorMessage = formErrorKey ? t(`common.errors.${formErrorKey}`) : '';
    const errorMessage = formErrorMessage || apiErrorMessage;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email.trim()) {
            setFormErrorKey('requiredEmail');
            return;
        }
        if (!password.trim()) {
            setFormErrorKey('requiredPassword');
            return;
        }
        if (!isValidEmail(email)) {
            setFormErrorKey('invalidEmail');
            return;
        }
        if (!isValidPassword(password)) {
            setFormErrorKey('invalidPassword');
            return;
        }
        setFormErrorKey('');
        loginMutation.mutate({ email, password });
    };

    return (
        <Container className="flex-col justify-start pt-28">
            <div className="w-full max-w-md space-y-6">
                <AuthHeader />
                <Card className="animate-fade-up p-8" variant="strong">
                    <div className="space-y-3 text-center">
                        <h2 className="font-display text-3xl font-semibold">{t('login.title')}</h2>
                        <p className="text-sm text-muted">{t('login.subtitle')}</p>
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                        <Input
                            id="login-email"
                            type="email"
                            label={t('common.fields.emailLabel')}
                            placeholder={t('common.fields.emailPlaceholder')}
                            value={email}
                            onChange={(event) => {
                                const next = event.target.value;
                                setEmail(next);
                                if (formErrorKey === 'requiredEmail' && next.trim()) {
                                    setFormErrorKey('');
                                } else if (formErrorKey === 'invalidEmail' && isValidEmail(next)) {
                                    setFormErrorKey('');
                                }
                            }}
                            required
                        />
                        <Input
                            id="login-password"
                            type="password"
                            label={t('common.fields.passwordLabel')}
                            placeholder={t('common.fields.passwordPlaceholder')}
                            value={password}
                            onChange={(event) => {
                                const next = event.target.value;
                                setPassword(next);
                                if (formErrorKey === 'requiredPassword' && next.trim()) {
                                    setFormErrorKey('');
                                } else if (formErrorKey === 'invalidPassword' && isValidPassword(next)) {
                                    setFormErrorKey('');
                                }
                            }}
                            required
                        />

                        <div className="flex items-center justify-between text-xs text-muted">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 dark:border-slate-600 dark:text-white"
                                />
                                <span>{t('login.remember')}</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => navigate('/forgot')}
                                className="text-link"
                            >
                                {t('login.forgot')}
                            </button>
                        </div>

                        <ErrorMessage message={errorMessage} />

                        <Button type="submit" fullWidth disabled={loginMutation.isPending}>
                            {loginMutation.isPending ? t('login.signingIn') : t('login.signIn')}
                        </Button>
                    </form>

                    <div className="mt-6 flex items-center justify-between text-xs text-muted">
                        <span>
                            {t('login.noAccount')}{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/signup')}
                                className="text-link"
                            >
                                {t('login.createAccount')}
                            </button>
                        </span>
                    </div>
                </Card>
            </div>
        </Container>
    );
}
