import { ChangeEventHandler } from "react";

export default function PropositionCardOption({
  option,
  index,
  onChange,
}: {
  option: any;
  index: number;
  onChange: ChangeEventHandler<HTMLInputElement>;
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
        className="btn btn-outline w-full h-24 normal-case text-base font-semibold
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
      </label>
    </div>
  );
}
