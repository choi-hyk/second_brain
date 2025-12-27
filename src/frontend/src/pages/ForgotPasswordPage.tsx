import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Container } from '../components/Container';
import { Input } from '../components/Input';
import { AuthHeader } from '../components/AuthHeader';

export function ForgotPasswordPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Container className="flex-col justify-start pt-28">
            <div className="w-full max-w-md space-y-6">
                <AuthHeader />
                <Card className="animate-fade-up p-8" variant="strong">
                    <div className="space-y-3 text-center">
                        <h2 className="font-display text-3xl font-semibold">{t('forgot.title')}</h2>
                        <p className="text-sm text-muted">{t('forgot.subtitle')}</p>
                    </div>

                    <form className="mt-6 space-y-4">
                        <Input
                            id="forgot-email"
                            type="email"
                            label={t('common.fields.emailLabel')}
                            placeholder={t('common.fields.emailPlaceholder')}
                        />

                        <Button type="button" fullWidth>
                            {t('forgot.submit')}
                        </Button>
                    </form>

                    <div className="mt-6 text-xs text-muted">
                        <button type="button" onClick={() => navigate('/')} className="text-link">
                            {t('forgot.backToLogin')}
                        </button>
                    </div>
                </Card>
            </div>
        </Container>
    );
}
