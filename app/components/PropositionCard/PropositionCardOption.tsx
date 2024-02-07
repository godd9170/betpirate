export default function PropositionCardOption({
  propositionId,
  option,
  selected,
  handleSelect,
}: {
  propositionId: string;
  option: any;
  selected: boolean;
  handleSelect: Function;
}) {
  return (
    <label className={`block w-full text-center`}>
      <input
        type="radio"
        name={propositionId}
        value={option?.id}
        checked={selected}
        className="absolute invisible"
        onChange={() => handleSelect()}
      />
      <div
        className={`grid h-20 flex-grow card bg-base-200 rounded-box place-items-center cursor-pointer  ${
          selected ? "bg-error" : ""
        }`}
      >
        {option?.title}
      </div>
    </label>
  );
}
