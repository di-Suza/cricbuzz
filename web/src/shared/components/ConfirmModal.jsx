import Modal from './Modal.jsx';
import LoadingLabel from './LoadingLabel.jsx';

function ConfirmModal({
  isOpen,
  title = 'Confirm action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  tone = 'danger',
  onClose,
  onConfirm,
}) {
  const confirmClassName =
    tone === 'danger'
      ? 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-100'
      : 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-100';

  return (
    <Modal isOpen={isOpen} onClose={isLoading ? undefined : onClose} title={title}>
      <div className="space-y-5">
        <p className="text-sm leading-6 text-slate-600">{message}</p>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-10 rounded-md px-4 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${confirmClassName}`}
          >
            {isLoading ? <LoadingLabel label="Working" /> : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
