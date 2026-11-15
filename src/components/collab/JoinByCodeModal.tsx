import React, { useEffect, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  KeyRound,
  Loader2,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CollabInviteRole, CollabProject, JoinRequestSource } from '../../types';
import {
  cancelOwnJoinRequest,
  fetchJoinedCollabProject,
  formatJoinCodeCooldown,
  getJoinCodeAttemptStatus,
  JOIN_CODE_MAX_ATTEMPTS,
  JoinCodeAttemptStatus,
  requestJoinByProjectCode,
  subscribeOwnJoinRequest,
} from '../../services/collabProjectService';
import { getRoleDisplayLabel } from './CollabMemberList';

export interface PendingJoinWaitState {
  projectId: string;
  projectTitle: string;
  requestedRole: CollabInviteRole;
  source: JoinRequestSource;
}

interface JoinByCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  initialPendingState?: PendingJoinWaitState | null;
  onJoinedProject: (project: CollabProject) => Promise<void> | void;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'danger') => void;
}

export const JoinByCodeModal: React.FC<JoinByCodeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  initialPendingState = null,
  onJoinedProject,
  onShowToast,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingState, setPendingState] = useState<PendingJoinWaitState | null>(null);
  const [alreadyPendingNotice, setAlreadyPendingNotice] = useState(false);
  const [alreadyMemberProject, setAlreadyMemberProject] = useState<CollabProject | null>(null);
  const [openingAlreadyMember, setOpeningAlreadyMember] = useState(false);
  const [rejectedMessage, setRejectedMessage] = useState<string | null>(null);
  const [approvedOpening, setApprovedOpening] = useState(false);
  const [attemptStatus, setAttemptStatus] = useState<JoinCodeAttemptStatus>(() =>
    getJoinCodeAttemptStatus(currentUser?.uid || '')
  );

  const inputRefs = useRef<Array<HTMLInputElement | null>>([null, null, null, null]);
  const handledApprovalRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setRejectedMessage(null);
    setApprovedOpening(false);
    setAlreadyPendingNotice(false);
    setAlreadyMemberProject(null);
    setOpeningAlreadyMember(false);
    setIsSubmitting(false);
    setIsCancelling(false);
    handledApprovalRef.current = null;
    setAttemptStatus(getJoinCodeAttemptStatus(currentUser?.uid || ''));

    if (initialPendingState) {
      setPendingState(initialPendingState);
    } else {
      setPendingState(null);
      setDigits(['', '', '', '']);
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialPendingState, currentUser?.uid]);

  // Đếm ngược thời gian khóa sau 5 lần nhập sai liên tiếp
  useEffect(() => {
    if (!isOpen || !currentUser?.uid || !attemptStatus.isLocked) return;
    const timer = setInterval(() => {
      const next = getJoinCodeAttemptStatus(currentUser.uid);
      setAttemptStatus(next);
      if (!next.isLocked) {
        setError(null);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [isOpen, currentUser?.uid, attemptStatus.isLocked]);

  // Lắng nghe trạng thái yêu cầu tham gia theo thời gian thực khi đang chờ chủ dự án duyệt
  useEffect(() => {
    if (!isOpen || !currentUser?.uid || !pendingState) return;
    const unsub = subscribeOwnJoinRequest(
      pendingState.projectId,
      currentUser.uid,
      async (req) => {
        if (!req) {
          return;
        }
        if (req.status === 'approved') {
          if (handledApprovalRef.current === pendingState.projectId) return;
          handledApprovalRef.current = pendingState.projectId;
          setApprovedOpening(true);
          try {
            const proj = await fetchJoinedCollabProject(pendingState.projectId);
            if (proj) {
              await onJoinedProject(proj);
              onShowToast?.(`Đã tham gia dự án nhóm "${proj.title}"`, 'success');
              onClose();
            } else {
              setApprovedOpening(false);
              setError('Yêu cầu đã được duyệt nhưng không tìm thấy dự án.');
            }
          } catch (err: any) {
            setApprovedOpening(false);
            setError(err?.message || 'Không thể mở dự án sau khi được duyệt.');
          }
        } else if (req.status === 'rejected') {
          setRejectedMessage('Yêu cầu của bạn chưa được chấp nhận.');
          setAlreadyPendingNotice(false);
          setPendingState(null);
        } else if (req.status === 'cancelled') {
          setAlreadyPendingNotice(false);
          setPendingState(null);
        }
      },
      () => {
        // Nếu người dùng đã bị xóa yêu cầu sau khi duyệt, thử mở dự án nếu đã thành công
      }
    );
    return () => unsub();
  }, [isOpen, currentUser?.uid, pendingState, onJoinedProject, onShowToast, onClose]);

  const codeValue = digits.join('');
  const isCodeComplete = codeValue.length === 4 && /^[0-9]{4}$/.test(codeValue);

  const handleDigitChange = (index: number, rawVal: string) => {
    if (attemptStatus.isLocked || isSubmitting) return;
    setError(null);
    setRejectedMessage(null);
    setAlreadyMemberProject(null);
    setAlreadyPendingNotice(false);
    const onlyDigits = rawVal.replace(/\D/g, '');
    if (onlyDigits.length > 1) {
      const next = [...digits];
      for (let i = 0; i < 4; i++) {
        next[i] = onlyDigits[i] || '';
      }
      setDigits(next);
      const focusIdx = Math.min(3, onlyDigits.length - 1);
      inputRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = onlyDigits;
    setDigits(next);

    if (onlyDigits && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter' && isCodeComplete) {
      e.preventDefault();
      handleSubmitCode();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;
    e.preventDefault();
    const next = ['', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    setError(null);
    setRejectedMessage(null);
    inputRefs.current[Math.min(3, Math.max(0, pasted.length - 1))]?.focus();
  };

  const handleSubmitCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      onClose();
      onOpenAuth();
      return;
    }

    const latestAttempt = getJoinCodeAttemptStatus(currentUser.uid);
    setAttemptStatus(latestAttempt);
    if (latestAttempt.isLocked) {
      setError(
        `Bạn đã nhập sai mã ${JOIN_CODE_MAX_ATTEMPTS} lần liên tiếp. Vui lòng thử lại sau ${formatJoinCodeCooldown(latestAttempt.cooldownRemainingSec)}.`
      );
      return;
    }

    if (!isCodeComplete) {
      setError('Vui lòng nhập đầy đủ 4 chữ số của mã dự án.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setRejectedMessage(null);
    setAlreadyMemberProject(null);
    setAlreadyPendingNotice(false);
    try {
      const result = await requestJoinByProjectCode(codeValue, currentUser);
      setAttemptStatus(getJoinCodeAttemptStatus(currentUser.uid));
      if (result.status === 'joined') {
        await onJoinedProject(result.project);
        onShowToast?.(`Đã mở dự án nhóm "${result.project.title}"`, 'success');
        onClose();
      } else if (result.status === 'already_member') {
        setAlreadyMemberProject(result.project);
      } else {
        setAlreadyPendingNotice(Boolean(result.alreadyPending));
        setPendingState({
          projectId: result.projectId,
          projectTitle: result.projectTitle,
          requestedRole: result.requestedRole,
          source: 'code',
        });
      }
    } catch (err: any) {
      setAttemptStatus(getJoinCodeAttemptStatus(currentUser.uid));
      setError(err?.message || 'Không thể kiểm tra mã dự án. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!currentUser || !pendingState) return;
    setIsCancelling(true);
    setError(null);
    try {
      await cancelOwnJoinRequest(pendingState.projectId, currentUser.uid);
      setPendingState(null);
      setDigits(['', '', '', '']);
      onShowToast?.('Đã hủy yêu cầu tham gia dự án', 'info');
    } catch (err: any) {
      setError(err?.message || 'Không thể hủy yêu cầu lúc này.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenAlreadyMember = async () => {
    if (!alreadyMemberProject) return;
    setOpeningAlreadyMember(true);
    try {
      await onJoinedProject(alreadyMemberProject);
      onClose();
    } finally {
      setOpeningAlreadyMember(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
          <span>Tham gia dự án nhóm</span>
        </div>
      }
      description={
        pendingState
          ? `Yêu cầu tham gia "${pendingState.projectTitle}" đã được gửi`
          : 'Nhập mã 4 chữ số do chủ sở hữu dự án nhóm chia sẻ'
      }
    >
      <div className="p-5 space-y-4">
        {!currentUser ? (
          <div className="p-4 rounded-[var(--radius-md)] bg-panel border border-default text-center space-y-3">
            <p className="text-xs text-secondary leading-relaxed">
              Bạn cần đăng nhập hoặc đăng ký tài khoản trước khi nhập mã tham gia dự án nhóm.
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="min-h-[44px] md:min-h-0"
            >
              Đăng nhập ngay
            </Button>
          </div>
        ) : pendingState ? (
          <div
            aria-live="polite"
            className="p-4 rounded-[var(--radius-md)] bg-panel border border-default space-y-4 text-center"
          >
            {alreadyPendingNotice && (
              <div
                role="status"
                className="p-2.5 rounded-[var(--radius-sm)] bg-accent-soft border border-[var(--accent-base)]/30 text-primary text-xs text-left"
              >
                Bạn đã có một yêu cầu đang chờ duyệt cho dự án này.
              </div>
            )}

            <div className="w-12 h-12 mx-auto rounded-full bg-accent-soft text-accent flex items-center justify-center">
              {approvedOpening ? (
                <CheckCircle2 className="w-6 h-6 text-success" strokeWidth={1.5} />
              ) : (
                <Loader2 className="w-6 h-6 animate-spin" strokeWidth={1.5} />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <h4 className="text-sm font-semibold text-primary">
                  {pendingState.projectTitle}
                </h4>
                <Badge variant="accent" size="sm">
                  {getRoleDisplayLabel(pendingState.requestedRole)}
                </Badge>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                {approvedOpening
                  ? 'Yêu cầu đã được chấp nhận! Đang mở dự án...'
                  : 'Đã gửi yêu cầu. Đang chờ chủ dự án chấp nhận.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted">
              <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>
                {pendingState.source === 'code'
                  ? 'Gửi qua mã dự án 4 chữ số'
                  : 'Gửi qua liên kết mời có yêu cầu duyệt'}
              </span>
            </div>

            {error && (
              <div
                role="alert"
                className="p-2.5 rounded-[var(--radius-sm)] bg-danger-soft border border-[var(--color-danger)]/30 text-danger text-xs text-left"
              >
                {error}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isCancelling || approvedOpening}
                onClick={handleCancelRequest}
                className="min-h-[44px] md:min-h-0"
              >
                {isCancelling ? 'Đang hủy...' : 'Hủy yêu cầu'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="min-h-[44px] md:min-h-0"
              >
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitCode} className="space-y-4">
            {rejectedMessage && (
              <div
                role="status"
                aria-live="polite"
                className="p-3 rounded-[var(--radius-sm)] bg-danger-soft border border-[var(--color-danger)]/30 text-danger text-xs flex items-start gap-2"
              >
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>{rejectedMessage}</span>
              </div>
            )}

            {alreadyMemberProject && (
              <div
                role="status"
                aria-live="polite"
                className="p-3 rounded-[var(--radius-sm)] bg-accent-soft border border-[var(--accent-base)]/30 text-primary text-xs flex flex-wrap items-center justify-between gap-2"
              >
                <span className="min-w-0 flex-1">
                  Bạn đã là thành viên của dự án <strong>{alreadyMemberProject.title}</strong>.
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  isLoading={openingAlreadyMember}
                  onClick={handleOpenAlreadyMember}
                  className="min-h-[44px] md:min-h-0 flex-shrink-0"
                >
                  Mở dự án
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-medium text-secondary text-center">
                Nhập mã gồm 4 chữ số
              </label>

              <div
                className="flex items-center justify-center gap-2.5 sm:gap-3"
                role="group"
                aria-label="Mã dự án gồm 4 chữ số"
              >
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    autoFocus={index === 0}
                    maxLength={4}
                    disabled={attemptStatus.isLocked || isSubmitting}
                    value={digit}
                    aria-label={`Chữ số thứ ${index + 1} của mã dự án`}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-13 h-14 sm:w-14 sm:h-14 text-center text-xl font-mono font-bold tabular-nums bg-input border border-default rounded-[var(--radius-md)] text-primary focus:outline-none focus:border-[var(--accent-base)] focus:ring-2 focus:ring-[var(--accent-base)]/25 disabled:opacity-50 transition-all"
                  />
                ))}
              </div>
            </div>

            {attemptStatus.isLocked && (
              <div
                role="alert"
                aria-live="polite"
                className="p-3 rounded-[var(--radius-sm)] bg-warning-soft border border-[var(--color-warning)]/30 text-warning text-xs flex items-start gap-2"
              >
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>
                  Bạn đã nhập sai mã {JOIN_CODE_MAX_ATTEMPTS} lần liên tiếp. Vui lòng thử lại sau{' '}
                  <strong className="tabular-nums">
                    {formatJoinCodeCooldown(attemptStatus.cooldownRemainingSec)}
                  </strong>.
                </span>
              </div>
            )}

            {error && !attemptStatus.isLocked && (
              <div
                role="alert"
                className="p-3 rounded-[var(--radius-sm)] bg-danger-soft border border-[var(--color-danger)]/30 text-danger text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 rounded-[var(--radius-sm)] bg-panel border border-default flex items-start gap-2 text-[11px] text-secondary">
              <ShieldCheck className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>
                Sau khi nhập mã hợp lệ, yêu cầu sẽ được gửi tới chủ sở hữu dự án. Bạn sẽ vào được dự án ngay khi chủ sở hữu bấm chấp nhận.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="min-h-[44px] md:min-h-0"
              >
                Đóng
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!isCodeComplete || attemptStatus.isLocked || isSubmitting}
                isLoading={isSubmitting}
                className="min-h-[44px] md:min-h-0"
              >
                {isSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
