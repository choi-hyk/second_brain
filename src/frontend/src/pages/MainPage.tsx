import { useTranslation } from 'react-i18next';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Container } from '../components/Container';
import { AuthHeader } from '../components/AuthHeader';

export function MainPage() {
    const { t } = useTranslation();

    return (
        <Container className="flex-col justify-start pt-24">
            <div className="w-full max-w-2xl space-y-6">
                <AuthHeader />
                <Card className="animate-fade-up p-8" variant="strong">
                    <div className="space-y-3">
                        <h2 className="font-display text-3xl font-semibold">{t('main.title')}</h2>
                        <p className="text-sm text-muted">{t('main.subtitle')}</p>
                    </div>
                    <div className="mt-6">
                        <Button type="button">{t('main.primaryAction')}</Button>
                    </div>
                </Card>
            </div>
        </Container>
    );
}
