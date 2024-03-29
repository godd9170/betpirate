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
      <div className="card-body">
        <h2 className="card-title inline-block">
          <span className="text-md font-semibold text-primary-content bg-primary rounded-sm text-sm mr-2 px-1 py-0.5 align-text-bottom">{`#${proposition.order}`}</span>
          {proposition.title}
        </h2>
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
