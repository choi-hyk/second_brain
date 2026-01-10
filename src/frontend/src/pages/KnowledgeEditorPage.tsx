import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { BookPlus, PencilLine } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorMessage } from '../components/ErrorMessage';
import { Input } from '../components/Input';
import { useKnowledgeList } from '../contexts/KnowledgeListContext';
import { useCreateKnowledgeMutation, useUpdateKnowledgeMutation } from '../hooks/useKnowledge';

const formatDate = (value: string | undefined) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '-';
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
};

const normalizeTags = (raw: string) =>
    Array.from(
        new Set(
            raw
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
                .map((tag) => tag.replace(/^#/, '')),
        ),
    );

const extractErrorMessage = (error: unknown, fallback: string) => {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === 'object') {
        const payload = error as { message?: unknown; detail?: unknown };
        if (typeof payload.message === 'string') return payload.message;
        if (typeof payload.detail === 'string') return payload.detail;
    }
    return fallback;
};

export function KnowledgeEditorPage() {
    const { t } = useTranslation();
    const { knowledgeId } = useParams();
    const isEditMode = Boolean(knowledgeId);
    const { knowledge = [], isPending, isError } = useKnowledgeList();
    const initializedRef = useRef(false);

    const entry = useMemo(() => {
        if (!knowledgeId) return undefined;
        return knowledge.find((item) => String(item.id) === knowledgeId);
    }, [knowledge, knowledgeId]);

    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [tags, setTags] = useState('');
    const [content, setContent] = useState('');
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const { mutate: createKnowledge, isPending: isCreatePending } = useCreateKnowledgeMutation({
        onSuccess: () => {
            setFormSuccess(t('main.newKnowledge.form.success'));
            setFormError('');
            setTitle('');
            setTopic('');
            setTags('');
            setContent('');
        },
        onError: (error) => {
            setFormSuccess('');
            setFormError(extractErrorMessage(error, t('main.newKnowledge.form.saveFailed')));
        },
    });

    const { mutate: updateKnowledge, isPending: isUpdatePending } = useUpdateKnowledgeMutation({
        onSuccess: () => {
            setFormSuccess(t('knowledgeEditor.form.success'));
            setFormError('');
        },
        onError: (error) => {
            setFormSuccess('');
            setFormError(extractErrorMessage(error, t('knowledgeEditor.form.saveFailed')));
        },
    });

    useEffect(() => {
        if (!isEditMode) {
            initializedRef.current = false;
            return;
        }
        if (!entry || initializedRef.current) return;
        setTitle(entry.title ?? '');
        setTopic(entry.topic ?? '');
        setTags((entry.tags ?? []).join(', '));
        setContent(entry.content ?? '');
        initializedRef.current = true;
    }, [entry, isEditMode]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmedTitle = title.trim();
        const trimmedTopic = topic.trim();
        const trimmedContent = content.trim();
        if (!trimmedTitle || !trimmedTopic || !trimmedContent) {
            setFormError(t('main.newKnowledge.form.requiredError'));
            setFormSuccess('');
            return;
        }

        const parsedTags = normalizeTags(tags);
        if (isEditMode) {
            if (!knowledgeId) return;
            updateKnowledge({
                knowledgeId: Number(knowledgeId),
                body: {
                    title: trimmedTitle,
                    topic: trimmedTopic,
                    content: trimmedContent,
                    tags: parsedTags.length ? parsedTags : undefined,
                },
            });
        } else {
            createKnowledge({
                title: trimmedTitle,
                topic: trimmedTopic,
                content: trimmedContent,
                tags: parsedTags.length ? parsedTags : undefined,
            });
        }
    };

    const handleClear = () => {
        if (isEditMode && entry) {
            setTitle(entry.title ?? '');
            setTopic(entry.topic ?? '');
            setTags((entry.tags ?? []).join(', '));
            setContent(entry.content ?? '');
        } else {
            setTitle('');
            setTopic('');
            setTags('');
            setContent('');
        }
        setFormError('');
        setFormSuccess('');
    };

    if (isEditMode && isPending) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <span className="badge-chip">{t('knowledgeContent.loading')}</span>
            </div>
        );
    }

    if (isEditMode && isError) {
        return (
            <Card className="p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
                    <PencilLine className="h-5 w-5 text-muted" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{t('knowledgeContent.loadFailed')}</h3>
                <p className="mt-2 text-sm text-muted">
                    {t('knowledgeContent.loadFailedHint')}
                </p>
            </Card>
        );
    }

    if (isEditMode && !entry) {
        return (
            <Card className="p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
                    <PencilLine className="h-5 w-5 text-muted" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                    {t('knowledgeContent.notFoundTitle')}
                </h3>
                <p className="mt-2 text-sm text-muted">{t('knowledgeContent.notFoundHint')}</p>
            </Card>
        );
    }

    const isBusy = isCreatePending || isUpdatePending;

    return (
        <div className="w-full space-y-10">
            <Card className="space-y-6 p-8 bg-transparent backdrop-blur-0 shadow-none border-transparent">
                {isEditMode && entry ? (
                    <div className="text-xs text-muted">
                        {t('knowledgeContent.meta.createdAt')} {formatDate(entry.created_at)} ·{' '}
                        {t('knowledgeContent.meta.updatedAt')} {formatDate(entry.updated_at)}
                    </div>
                ) : null}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-1 flex-wrap items-start gap-4">
                            <div className="min-w-[220px] flex-1">
                                <Input
                                    id="note-title"
                                    label={t('main.newKnowledge.form.titleLabel')}
                                    placeholder={t('main.newKnowledge.form.titlePlaceholder')}
                                    value={title}
                                    onChange={(event) => {
                                        setTitle(event.target.value);
                                        if (formError) setFormError('');
                                        if (formSuccess) setFormSuccess('');
                                    }}
                                    required
                                />
                            </div>
                            <div className="min-w-[180px]">
                                <Input
                                    id="note-topic"
                                    label={t('main.newKnowledge.form.topicLabel')}
                                    placeholder={t('main.newKnowledge.form.topicPlaceholder')}
                                    value={topic}
                                    onChange={(event) => {
                                        setTopic(event.target.value);
                                        if (formError) setFormError('');
                                        if (formSuccess) setFormSuccess('');
                                    }}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            {isEditMode ? (
                                <Link
                                    to={entry ? `/app/knowledge/${entry.id}` : '/app'}
                                    className="shrink-0"
                                >
                                    <Button type="button" variant="outline" className="h-10 px-4 text-xs">
                                        {t('knowledgeEditor.back')}
                                    </Button>
                                </Link>
                            ) : null}
                            <Button type="submit" className="h-10 px-4 text-xs" disabled={isBusy}>
                                {isBusy
                                    ? isEditMode
                                        ? t('knowledgeEditor.form.savingButton')
                                        : t('main.newKnowledge.form.savingButton')
                                    : isEditMode
                                      ? t('knowledgeEditor.form.saveButton')
                                      : t('main.newKnowledge.form.saveButton')}
                            </Button>
                        </div>
                    </div>
                    <Input
                        id="note-tags"
                        label={t('main.newKnowledge.form.tagsLabel')}
                        placeholder={t('main.newKnowledge.form.tagsPlaceholder')}
                        value={tags}
                        onChange={(event) => {
                            setTags(event.target.value);
                            if (formError) setFormError('');
                            if (formSuccess) setFormSuccess('');
                        }}
                    />
                    <div className="space-y-2">
                        <label
                            htmlFor="note-content"
                            className="text-xs font-semibold uppercase tracking-[0.25em] text-muted"
                        >
                            {t('main.newKnowledge.form.contentLabel')}
                        </label>
                        <textarea
                            id="note-content"
                            className="input-field min-h-[240px] resize-y"
                            placeholder={t('main.newKnowledge.form.contentPlaceholder')}
                            value={content}
                            onChange={(event) => {
                                setContent(event.target.value);
                                if (formError) setFormError('');
                                if (formSuccess) setFormSuccess('');
                            }}
                            required
                        />
                        <p className="text-xs text-muted">
                            {t('main.newKnowledge.form.contentHint')}
                        </p>
                    </div>

                    <ErrorMessage message={formError} />
                    {formSuccess ? (
                        <p className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600">
                            {formSuccess}
                        </p>
                    ) : null}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted">
                            {isEditMode ? (
                                <>
                                    <PencilLine className="h-4 w-4" aria-hidden="true" />
                                    {t('knowledgeEditor.subtitle')}
                                </>
                            ) : (
                                <>
                                    <BookPlus className="h-4 w-4" aria-hidden="true" />
                                    {t('main.newKnowledge.subtitle')}
                                </>
                            )}
                        </div>
                        <Button type="button" variant="outline" onClick={handleClear}>
                            {t('main.newKnowledge.form.clearButton')}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
