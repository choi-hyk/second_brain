import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Container } from '../components/Container';
import { Input } from '../components/Input';
import { AuthHeader } from '../components/AuthHeader';

export function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Container className="flex-col justify-start pt-28">
            <div className="w-full max-w-md space-y-6">
                <AuthHeader />
                <Card className="animate-fade-up p-8" variant="strong">
                    <div className="space-y-3 text-center">
                        <h2 className="font-display text-3xl font-semibold">{t('login.title')}</h2>
                        <p className="text-sm text-muted">{t('login.subtitle')}</p>
                    </div>

                    <form className="mt-6 space-y-4">
                        <Input
                            id="login-email"
                            type="email"
                            label={t('common.fields.emailLabel')}
                            placeholder={t('common.fields.emailPlaceholder')}
                        />
                        <Input
                            id="login-password"
                            type="password"
                            label={t('common.fields.passwordLabel')}
                            placeholder={t('common.fields.passwordPlaceholder')}
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

                        <Button type="button" fullWidth>
                            {t('login.signIn')}
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
