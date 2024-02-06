import { Proposition, PropositionOption } from "@prisma/client";
import PropositionCardOption from "./PropositionCardOption";
import { useState } from "react";

export default function PropositionCard({
  proposition,
}: {
  proposition: Proposition & { options: PropositionOption[] };
}) {
  const [selectedOption, setSelectedOption] = useState<PropositionOption>();
  return (
    <div
      id={`proposition-${proposition?.order}`}
      className="card card-compact w-full bg-base-100 shadow-xl mb-4 first:mt-4"
    >
      <figure>
        <img src="https://iili.io/J12Ni0B.md.webp" alt="J12Ni0B.md.webp" />
      </figure>
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
        <div className="card-actions justify-end">
          <div className="flex w-full">
            <PropositionCardOption
              propositionId={proposition?.id}
              option={proposition?.options[0]}
              selected={proposition?.options[0]?.id === selectedOption?.id}
              handleSelect={() => setSelectedOption(proposition?.options[0])}
            />
            <div className="divider divider-horizontal">OR</div>
            <PropositionCardOption
              propositionId={proposition?.id}
              option={proposition?.options[1]}
              selected={proposition?.options[1]?.id === selectedOption?.id}
              handleSelect={() => setSelectedOption(proposition?.options[1])}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
