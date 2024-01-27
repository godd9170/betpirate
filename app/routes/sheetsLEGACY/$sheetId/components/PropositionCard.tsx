import type { Proposition, PropositionOption } from "@prisma/client";

export default ({
  proposition,
}: {
  proposition: Proposition & { options: PropositionOption[] };
}) => {
  return (
    <div className="mb-10">
      <label className="text-base font-semibold text-gray-900">
        {proposition.title}
      </label>
      <p className="text-sm text-gray-500">{proposition.subtitle}</p>
      <fieldset className="mt-4">
        <legend className="sr-only">{proposition.title}</legend>
        <div className="space-y-4">
          {proposition.options.map((option: PropositionOption) => (
            <div key={option.id} className="flex items-center">
              <input
                id={option.id}
                value={option.id}
                name={proposition.id}
                type="radio"
                className="h-4 w-4 border-gray-300 text-slate-600 focus:ring-slate-600"
              />
              <label
                htmlFor={option.id}
                className="ml-3 block text-sm font-medium leading-6 text-gray-900"
              >
                {option.title}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
};
