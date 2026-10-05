import type { Attendance } from "@/lib/rsvps";

type AttendanceChoiceProps = {
  name: string;
  legend: string;
  value: Attendance | "";
  onChange: (value: Attendance) => void;
  yesLabel: string;
  noLabel: string;
};

/** The same keyboard-accessible choice for guests and hosts. */
export function AttendanceChoice({ name, legend, value, onChange, yesLabel, noLabel }: AttendanceChoiceProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold leading-relaxed text-foreground">{legend}</legend>
      <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
        {([{ value: "yes", label: yesLabel }, { value: "no", label: noLabel }] as const).map((option) => (
          <label key={option.value} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer absolute inset-0 z-10 m-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              required
            />
            <span className="flex min-h-12 items-center gap-3 rounded-xl border border-input bg-white/80 px-4 py-3 text-sm font-semibold leading-relaxed text-muted-foreground transition-colors peer-hover:border-primary peer-checked:border-primary peer-checked:bg-secondary peer-checked:text-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
              <span aria-hidden className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${value === option.value ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                {value === option.value && <span className="size-1.5 rounded-full bg-white" />}
              </span>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
