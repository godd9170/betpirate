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
        className="block w-full grid h-20 flex-grow card rounded-box place-items-center cursor-pointer 
             bg-base-200 text-center border border-transparent transition-all 
             peer-checked:bg-gray-500 peer-checked:border-white peer-checked:text-white 
             peer-checked:shadow-lg peer-checked:shadow-gray-500/50"
        htmlFor={option?.id}
      >
        {option?.title}
      </label>
    </div>
  );
}
