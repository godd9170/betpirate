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
        className="w-full grid h-20 flex-grow card rounded-box place-items-center cursor-pointer 
             bg-base-300 text-center border border-transparent transition-all peer-checked:bg-primary 
             peer-checked:text-primary-content peer-checked:border-primary-content hover:border-primary"
        htmlFor={option?.id}
      >
        {option?.title}
      </label>
    </div>
  );
}
