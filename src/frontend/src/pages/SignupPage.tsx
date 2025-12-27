import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Container } from '../components/Container';
import { Input } from '../components/Input';
import { AuthHeader } from '../components/AuthHeader';

export function SignupPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Container className="flex-col justify-start pt-28">
            <div className="w-full max-w-md space-y-6">
                <AuthHeader />
                <Card className="animate-fade-up p-8" variant="strong">
                    <div className="space-y-3 text-center">
                        <h2 className="font-display text-3xl font-semibold">{t('signup.title')}</h2>
                        <p className="text-sm text-muted">{t('signup.subtitle')}</p>
                    </div>

                    <form className="mt-6 space-y-4">
                        <Input
                            id="signup-name"
                            type="text"
                            label={t('common.fields.nameLabel')}
                            placeholder={t('common.fields.namePlaceholder')}
                        />
                        <Input
                            id="signup-email"
                            type="email"
                            label={t('common.fields.emailLabel')}
                            placeholder={t('common.fields.emailPlaceholder')}
                        />
                        <Input
                            id="signup-password"
                            type="password"
                            label={t('common.fields.passwordLabel')}
                            placeholder={t('common.fields.passwordPlaceholder')}
                        />
                        <Input
                            id="signup-password-confirm"
                            type="password"
                            label={t('common.fields.confirmPasswordLabel')}
                            placeholder={t('common.fields.confirmPasswordPlaceholder')}
                        />

                        <Button type="button" fullWidth>
                            {t('signup.submit')}
                        </Button>
                    </form>

                    <div className="mt-6 text-xs text-muted">
                        <button type="button" onClick={() => navigate('/')} className="text-link">
                            {t('signup.backToLogin')}
                        </button>
                    </div>
                </Card>
            </div>
        </Container>
    );
}
