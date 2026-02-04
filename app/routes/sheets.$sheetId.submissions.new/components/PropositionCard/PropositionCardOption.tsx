import { ChangeEventHandler } from "react";

export default function PropositionCardOption({
  option,
  index,
  onChange,
  percentage,
  isSelected,
}: {
  option: any;
  index: number;
  onChange: ChangeEventHandler<HTMLInputElement>;
  percentage: number | null;
  isSelected?: boolean;
}) {
  const hasImage = Boolean(option?.imageUrl);
  const heightClass = hasImage ? "min-h-32" : "min-h-24";
  const textSizeClass = hasImage ? "text-sm" : "text-base";
  const selectedTextClass = hasImage
    ? "peer-checked:text-base"
    : "peer-checked:text-lg";
  return (
    <div className="w-full">
      <input
        type="radio"
        id={option?.id}
        name={`selections[${index}].optionId`}
        value={option?.id}
        className="peer absolute invisible"
        onChange={onChange}
        defaultChecked={isSelected}
      />
      <label
        className={`btn btn-outline w-full h-auto ${heightClass} flex-col gap-1 normal-case ${textSizeClass} font-semibold leading-tight overflow-hidden
             peer-checked:btn-primary peer-checked:font-bold ${selectedTextClass}
             transition-all hover:scale-[1.02] peer-checked:scale-[1.03]`}
        htmlFor={option?.id}
      >
        <span className="relative flex w-full flex-col items-center gap-2 text-center">
          {hasImage && (
            <span className="w-full overflow-hidden rounded-lg">
              <img
                src={option.imageUrl}
                alt={option?.shortTitle || option?.title}
                className="h-14 w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </span>
          )}
          <span className="leading-snug">{option?.title}</span>
          <span className="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 transition-opacity text-xl">
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
