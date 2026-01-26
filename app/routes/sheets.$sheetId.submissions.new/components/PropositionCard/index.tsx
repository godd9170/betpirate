import { Proposition, PropositionOption } from "@prisma/client";
import PropositionCardOption from "./PropositionCardOption";

import React, { forwardRef } from "react";

const PropositionCard = forwardRef<
  HTMLDivElement,
  {
    proposition: Proposition & { options: PropositionOption[] };
    onSelection: Function;
    propositionIndex: number;
  }
>(({ proposition, onSelection, propositionIndex }, ref) => {
  return (
    <div
      id={proposition.id}
      className="card card-sm bg-base-100 m-4"
      ref={ref}
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
          <div className="grid grid-cols-2 gap-2 w-full">
            {proposition.options.map((option) => (
              <div className="col-span-1">
                <PropositionCardOption
                  key={option?.id}
                  option={option}
                  onChange={() => onSelection(proposition?.id, option?.id)}
                  index={propositionIndex}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default PropositionCard;
