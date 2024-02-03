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
    <div className="card card-compact w-full bg-base-100 shadow-xl">
      {/* <figure>
        <img
          src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
          alt="Shoes"
        />
      </figure> */}
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
