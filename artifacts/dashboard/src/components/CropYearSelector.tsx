import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cropYearLabel, cropYearOptions, currentCropYear } from "@/lib/cropYear";

interface Props {
  value: number;
  onChange: (year: number) => void;
  count?: number;
  className?: string;
}

export function CropYearSelector({ value, onChange, count = 7, className }: Props) {
  const options = cropYearOptions(count);
  const current = currentCropYear();
  return (
    <Select value={String(value)} onValueChange={v => onChange(Number(v))}>
      <SelectTrigger className={className ?? "h-9 w-40 text-sm"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(y => (
          <SelectItem key={y} value={String(y)}>
            {cropYearLabel(y)}{y === current ? " (current)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
