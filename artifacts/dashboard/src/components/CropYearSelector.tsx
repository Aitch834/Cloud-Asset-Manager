import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cropYearLabel, cropYearOptions, currentCropYear } from "@/lib/cropYear";

interface Props {
  value: number;
  onChange: (year: number) => void;
  count?: number;
  className?: string;
  showAllYears?: boolean;
}

export function CropYearSelector({ value, onChange, count = 7, className, showAllYears = false }: Props) {
  const options = cropYearOptions(count);
  const current = currentCropYear();
  return (
    <Select value={String(value)} onValueChange={v => onChange(Number(v))}>
      <SelectTrigger className={className ?? "w-44"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {showAllYears && (
          <SelectItem value="0">All years</SelectItem>
        )}
        {options.map(y => (
          <SelectItem key={y} value={String(y)}>
            {cropYearLabel(y)}{y === current ? " (current)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
