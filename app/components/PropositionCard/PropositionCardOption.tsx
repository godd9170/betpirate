import { ChangeEventHandler } from "react";

export default function PropositionCardOption({
  propositionId,
  option,
  onChange,
}: {
  propositionId: string;
  option: any;
  onChange: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <div className="w-full">
      <input
        type="radio"
        id={option?.id}
        name={propositionId}
        value={option?.id}
        className="peer absolute invisible"
        onChange={onChange}
      />
      <label
        className="block w-full grid h-20 flex-grow card rounded-box place-items-center cursor-pointer bg-base-200 text-center peer-checked:bg-error"
        htmlFor={option?.id}
      >
        {option?.title}
      </label>
    </div>
  );
}
