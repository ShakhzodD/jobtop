type Props = { applied: boolean; applyLabel: string; appliedLabel: string; onApply: () => void | Promise<void> };

export function ApplyToJobButton({ applied, applyLabel, appliedLabel, onApply }: Props) {
  return <button className="jt-apply" type="button" disabled={applied} onClick={() => void onApply()}>{applied ? appliedLabel : applyLabel}</button>;
}
