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
    <label className={`block w-full`}>
      <input
        type="radio"
        name={propositionId}
        value={option?.id}
        className="invisible"
        checked={selected}
        onChange={() => handleSelect()}
      />
      <div
        className={`grid h-20 flex-grow card bg-base-300 rounded-box place-items-center cursor-pointer  ${
          selected ? "bg-white" : ""
        }`}
      >
        {option?.title}
      </div>
    </label>
  );
}
