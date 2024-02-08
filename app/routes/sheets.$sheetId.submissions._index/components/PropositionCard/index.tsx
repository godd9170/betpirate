import { Proposition, PropositionOption } from "@prisma/client";
import PropositionCardOption from "./PropositionCardOption";
import { useState } from "react";

export default function PropositionCard({
  proposition,
  onSelection,
  propositionIndex,
}: {
  proposition: Proposition & { options: PropositionOption[] };
  onSelection: Function;
  propositionIndex: number;
}) {
  const [selectedOption, setSelectedOption] = useState<PropositionOption>();
  return (
    <div
      id={`proposition-${proposition?.order}`}
      className="card card-compact w-full bg-base-100 shadow-xl mb-4 first:mt-4"
    >
      {!!proposition?.imageUrl && (
        <figure>
          <img src={proposition.imageUrl} alt={proposition?.shortTitle || ""} />
        </figure>
      )}
      <span className="absolute inset-3">
        <div className="flex justify-end">
          <div className="inline-flex items-center px-2 py-1 rounded-full text-md font-semibold leading-4 bg-primary text-primary-content">
            {`#${proposition.order}`}
          </div>
        </div>
      </span>
      <div className="card-body">
        <h2 className="card-title">{proposition.title}</h2>
        <p>{proposition.subtitle}</p>
        <div className="card-actions pt-2">
          <div className="flex w-full space-x-1">
            {proposition.options.map((option) => (
              <PropositionCardOption
                key={option?.id}
                option={option}
                onChange={() => onSelection(proposition?.id, option?.id)}
                index={propositionIndex}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
