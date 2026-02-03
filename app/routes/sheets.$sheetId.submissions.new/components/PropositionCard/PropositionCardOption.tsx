import { ChangeEventHandler } from "react";

export default function PropositionCardOption({
  option,
  index,
  onChange,
  percentage,
}: {
  option: any;
  index: number;
  onChange: ChangeEventHandler<HTMLInputElement>;
  percentage: number | null;
}) {
  return (
    <div className="w-full">
      <input
        type="radio"
        id={option?.id}
        name={`selections[${index}].optionId`}
        value={option?.id}
        className="peer absolute invisible"
        onChange={onChange}
      />
      <label
        className="btn btn-outline w-full h-24 flex-col gap-1 normal-case text-base font-semibold
             peer-checked:btn-primary peer-checked:font-bold peer-checked:text-lg
             transition-all hover:scale-[1.02] peer-checked:scale-[1.03]"
        htmlFor={option?.id}
      >
        <span className="relative">
          {option?.title}
          <span className="absolute -top-3 -right-6 opacity-0 peer-checked:opacity-100 transition-opacity text-2xl">
            ✓
          </span>
        </span>
        {percentage !== null && (
          <span className="text-xs font-normal opacity-50">
            {percentage}% picked this
          </span>
        )}
      </label>
    </div>
  );
}
