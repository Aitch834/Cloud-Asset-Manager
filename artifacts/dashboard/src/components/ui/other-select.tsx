import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface OtherSelectProps {
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  specifyPlaceholder?: string;
  className?: string;
}

/**
 * OtherSelect — a dropdown that reveals a free-text input when "Other" is chosen.
 *
 * The `value` prop holds the resolved value. If it is a known option it shows
 * that option selected. If it is "Other" or a custom string not in the list,
 * the Select shows "Other (please specify)" and a text input appears below so
 * the user can record what the "Other" actually is.
 *
 * The `onValueChange` callback is always called with the actual intended value —
 * "Other" while the user hasn't typed yet, or the typed string once they do.
 * The word "Other" is therefore never persisted when the user has specified something.
 */
export function OtherSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  specifyPlaceholder = "Please specify…",
  className,
}: OtherSelectProps) {
  const knownNonOther = options.filter(o => o !== "Other");
  const isCustom = !!value && value !== "Other" && !knownNonOther.includes(value);
  const showInput = value === "Other" || isCustom;
  const selectVal = showInput ? "Other" : (value || "__other_none__");
  const inputVal = isCustom ? value : "";

  return (
    <div className={className}>
      <Select
        value={selectVal}
        onValueChange={v => onValueChange(v === "__other_none__" ? "" : v)}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__other_none__">— {placeholder} —</SelectItem>
          {options.map(o => (
            <SelectItem key={o} value={o}>
              {o === "Other" ? "Other (please specify)" : o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showInput && (
        <Input
          className="mt-1.5"
          value={inputVal}
          onChange={e => onValueChange(e.target.value || "Other")}
          placeholder={specifyPlaceholder}
          autoFocus={value === "Other"}
        />
      )}
    </div>
  );
}
