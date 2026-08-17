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
    <Button
      className="h-12 w-full bg-emerald-700 hover:bg-emerald-800"
      type="button"
      disabled={applied}
      onClick={() => void onApply()}
    >
      {applied ? appliedLabel : applyLabel}
    </Button>
  );
}
import { Button } from "@/components/ui/button";
