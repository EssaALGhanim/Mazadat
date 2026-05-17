import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { addComment, deleteComment, editComment, getComments } from '@/services/commentService';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const MAX_COMMENT_LENGTH = 500;

function formatCommentTime(dateValue, locale) {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    const now = Date.now();
    const secondsDiff = Math.round((date.getTime() - now) / 1000);
    const absoluteSeconds = Math.abs(secondsDiff);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (absoluteSeconds < 60) {
        return rtf.format(secondsDiff, 'second');
    }
    if (absoluteSeconds < 3600) {
        return rtf.format(Math.round(secondsDiff / 60), 'minute');
    }
    if (absoluteSeconds < 86400) {
        return rtf.format(Math.round(secondsDiff / 3600), 'hour');
    }
    if (absoluteSeconds < 604800) {
        return rtf.format(Math.round(secondsDiff / 86400), 'day');
    }

    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export default function AuctionComments({ auctionId, currentUser, auctionSellerUsername }) {
    const { t, i18n } = useTranslation('common');
    const isAr = i18n.language === 'ar';
    const locale = isAr ? 'ar-SA' : 'en-US';

    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    const [commentPendingDelete, setCommentPendingDelete] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const canPost = currentUser && ['BUYER', 'SELLER'].includes(currentUser.role);
    const canViewInputHint = !currentUser;

    const remainingNewChars = MAX_COMMENT_LENGTH - newComment.length;
    const remainingEditChars = MAX_COMMENT_LENGTH - editingContent.length;

    const loadComments = async () => {
        try {
            setLoading(true);
            const data = await getComments(auctionId);
            setComments(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error(error.message || t('comments.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auctionId) {
            loadComments();
        }
    }, [auctionId]);

    const commentPermissions = useMemo(() => {
        const username = currentUser?.username;
        const isAuctionSeller = Boolean(
            currentUser?.role === 'SELLER'
            && auctionSellerUsername
            && username
            && username === auctionSellerUsername
        );

        return comments.reduce((acc, comment) => {
            const isOwner = username && comment.username === username;
            acc[comment.id] = {
                canEdit: Boolean(isOwner),
                canDelete: Boolean(isOwner || isAuctionSeller),
            };
            return acc;
        }, {});
    }, [auctionSellerUsername, comments, currentUser?.role, currentUser?.username]);

    const handleSubmitComment = async (event) => {
        event.preventDefault();
        const content = newComment.trim();

        if (!content) {
            toast.error(t('comments.emptyError'));
            return;
        }

        try {
            setSubmitting(true);
            await addComment(auctionId, content);
            setNewComment('');
            toast.success(t('comments.addSuccess'));
            await loadComments();
        } catch (error) {
            toast.error(error.message || t('comments.addError'));
        } finally {
            setSubmitting(false);
        }
    };

    const startEditing = (comment) => {
        setEditingCommentId(comment.id);
        setEditingContent(comment.content || '');
    };

    const cancelEditing = () => {
        setEditingCommentId(null);
        setEditingContent('');
    };

    const handleSaveEdit = async (commentId) => {
        const content = editingContent.trim();
        if (!content) {
            toast.error(t('comments.emptyError'));
            return;
        }

        try {
            setSavingEdit(true);
            await editComment(auctionId, commentId, content);
            toast.success(t('comments.editSuccess'));
            cancelEditing();
            await loadComments();
        } catch (error) {
            toast.error(error.message || t('comments.editError'));
        } finally {
            setSavingEdit(false);
        }
    };

    const askDeleteComment = (comment) => {
        setCommentPendingDelete(comment);
        setConfirmDeleteOpen(true);
    };

    const handleDeleteComment = async () => {
        if (!commentPendingDelete?.id) return;

        try {
            setDeletingCommentId(commentPendingDelete.id);
            await deleteComment(auctionId, commentPendingDelete.id);
            setComments((prevComments) => prevComments.filter((item) => item.id !== commentPendingDelete.id));
            if (editingCommentId === commentPendingDelete.id) {
                cancelEditing();
            }
            toast.success(t('comments.deleteSuccess'));
        } catch (error) {
            toast.error(error.message || t('comments.deleteError'));
        } finally {
            setConfirmDeleteOpen(false);
            setCommentPendingDelete(null);
            setDeletingCommentId(null);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#C5E0DC] dark:border-slate-700 p-6 shadow-sm">
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-[#2A9D8F]" />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-sm text-[#6B9E99] dark:text-slate-400 py-2">
                        {t('comments.emptyState')}
                    </p>
                ) : (
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                        {comments.map((comment) => {
                            const permission = commentPermissions[comment.id] || { canEdit: false, canDelete: false };
                            const isEditing = editingCommentId === comment.id;
                            return (
                                <div
                                    key={comment.id}
                                    className="rounded-lg border border-[#DDEDEA] dark:border-slate-700 bg-[#F9FCFC] dark:bg-slate-800/70 p-4"
                                >
                                    <div className={`flex items-start justify-between gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                                        <div className={`min-w-0 ${isAr ? 'text-right' : ''}`}>
                                            <p className="text-sm font-semibold text-[#1A2E2C] dark:text-slate-100">
                                                {comment.username}
                                            </p>
                                            <p className="text-xs text-[#6B9E99] dark:text-slate-400 mt-0.5">
                                                {formatCommentTime(comment.updatedAt || comment.createdAt, locale)}
                                            </p>
                                        </div>
                                        {(permission.canEdit || permission.canDelete) && !isEditing && (
                                            <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                                                {permission.canEdit && (
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditing(comment)}
                                                        className="p-1.5 rounded-md text-[#2A9D8F] hover:bg-[#EAF7F5] dark:hover:bg-emerald-950/30 transition-colors"
                                                        title={t('comments.edit')}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {permission.canDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() => askDeleteComment(comment)}
                                                        disabled={deletingCommentId === comment.id}
                                                        className="p-1.5 rounded-md text-[#E05252] hover:bg-[#FFF1F1] dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50"
                                                        title={t('comments.delete')}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="mt-3 space-y-2">
                                            <textarea
                                                value={editingContent}
                                                onChange={(event) => setEditingContent(event.target.value.slice(0, MAX_COMMENT_LENGTH))}
                                                rows={3}
                                                dir={isAr ? 'rtl' : 'ltr'}
                                                className="w-full rounded-lg border border-[#C5E0DC] dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-[#1A2E2C] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30"
                                                placeholder={t('comments.placeholder')}
                                            />
                                            <div className={`flex items-center justify-between text-xs ${isAr ? 'flex-row-reverse' : ''}`}>
                                                <span className="text-[#6B9E99] dark:text-slate-400">
                                                    {t('comments.charactersLeft', { count: remainingEditChars })}
                                                </span>
                                                <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                                                    <button
                                                        type="button"
                                                        onClick={cancelEditing}
                                                        className="px-3 py-1.5 rounded-md border border-[#C5E0DC] dark:border-slate-600 text-[#1A2E2C] dark:text-slate-200 hover:bg-[#F4FAFA] dark:hover:bg-slate-800 text-xs font-semibold"
                                                    >
                                                        {t('comments.cancel')}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSaveEdit(comment.id)}
                                                        disabled={savingEdit}
                                                        className="px-3 py-1.5 rounded-md bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white text-xs font-semibold disabled:opacity-50"
                                                    >
                                                        {t('comments.save')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p
                                            dir={isAr ? 'rtl' : 'ltr'}
                                            className={`mt-3 text-sm leading-relaxed text-[#1A2E2C] dark:text-slate-200 whitespace-pre-wrap break-words ${isAr ? 'text-right' : ''}`}
                                        >
                                            {comment.content}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {canPost && (
                    <form onSubmit={handleSubmitComment} className="pt-2 border-t border-[#E0EEEB] dark:border-slate-700 space-y-2">
                        <textarea
                            value={newComment}
                            onChange={(event) => setNewComment(event.target.value.slice(0, MAX_COMMENT_LENGTH))}
                            rows={3}
                            dir={isAr ? 'rtl' : 'ltr'}
                            placeholder={t('comments.placeholder')}
                            className="w-full rounded-lg border border-[#C5E0DC] dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-[#1A2E2C] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30"
                        />
                        <div className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                            <span className="text-xs text-[#6B9E99] dark:text-slate-400">
                                {t('comments.charactersLeft', { count: remainingNewChars })}
                            </span>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 rounded-lg bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white text-sm font-bold disabled:opacity-50"
                            >
                                {t('comments.post')}
                            </button>
                        </div>
                    </form>
                )}

                {canViewInputHint && (
                    <p className="text-sm text-[#6B9E99] dark:text-slate-400 pt-2 border-t border-[#E0EEEB] dark:border-slate-700">
                        {t('comments.loginToComment')}
                    </p>
                )}
            </div>

            <ConfirmDialog
                open={confirmDeleteOpen}
                onOpenChange={(open) => {
                    setConfirmDeleteOpen(open);
                    if (!open) {
                        setCommentPendingDelete(null);
                    }
                }}
                title={t('comments.confirmDeleteTitle')}
                description={t('comments.confirmDeleteDescription')}
                confirmText={t('comments.delete')}
                cancelText={t('comments.cancel')}
                onConfirm={handleDeleteComment}
            />
        </div>
    );
}
