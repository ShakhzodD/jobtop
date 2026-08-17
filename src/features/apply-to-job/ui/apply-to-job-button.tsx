type Props = {
  applied: boolean;
  applyLabel: string;
  appliedLabel: string;
  onApply: () => void | Promise<void>;
};

export function ApplyToJobButton({
  applied,
  applyLabel,
  appliedLabel,
  onApply,
}: Props) {
  return (
    <button
      className="h-12 w-full rounded-2xl bg-emerald-700 text-sm font-bold text-white transition-colors hover:bg-emerald-800 disabled:bg-emerald-200"
      type="button"
      disabled={applied}
      onClick={() => void onApply()}
    >
      {applied ? appliedLabel : applyLabel}
    </button>
  );
}
