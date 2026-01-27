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
      className="card card-bordered bg-base-100 shadow-xl hover:shadow-2xl transition-shadow scroll-mt-24"
      ref={ref}
    >
      {!!proposition?.imageUrl && (
        <figure className="max-h-64">
          <img
            src={proposition.imageUrl}
            alt={proposition?.shortTitle || ""}
            className="w-full object-cover"
          />
        </figure>
      )}
      <div className="card-body">
        <div className="flex items-start gap-3 mb-3">
          <div className="badge badge-primary badge-lg font-bold text-lg px-4 py-4">
            #{proposition.order}
          </div>
          <div className="flex-1">
            <h2 className="card-title text-2xl font-black leading-tight mb-2">
              {proposition.title}
            </h2>
            {proposition.subtitle && (
              <p className="opacity-70 text-sm leading-relaxed">
                {proposition.subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="divider my-2"></div>

        <div className="card-actions">
          <div className="grid grid-cols-2 gap-3 w-full">
            {proposition.options.map((option) => (
              <div key={option?.id} className="col-span-1">
                <PropositionCardOption
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
