import { useMemo } from "react";
import { IoTrophy } from "react-icons/io5";
import Ordinal from "~/components/Ordinal";

function PropCell({ option }: any) {
  const color = !!option.answerId
    ? option.answerId === option.id
      ? "bg-green-700"
      : "bg-red-700"
    : "";
  return (
    <td className={`p-2 border text-center text-xs ${color}`}>
      {option.shortTitle}
    </td>
  );
}

export default function PropMatrix({
  sheet,
  leaders,
}: {
  sheet: any;
  leaders: any;
}) {
  console.log("SHEET:", sheet);
  console.log("leaders: ", leaders);
  const options = sheet.propositions.reduce((acc, proposition) => {
    proposition.options.forEach((option) => {
      acc[option.id] = {
        ...option,
        propositionId: proposition.id,
        answerId: proposition.answerId,
      };
    });
    return acc;
  }, {});
  console.log("OPTIONS: ", options);
  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 border">Sailor</th>
            <th className="p-2 border">#</th>
            {sheet.propositions.map((proposition, index) => (
              <th
                key={index}
                className="border text-sm h-40 align-bottom"
                title={proposition.shortTitle}
              >
                <div
                  style={{
                    transform: "rotate(-90deg)",
                    whiteSpace: "nowrap",
                    transformOrigin: "center", //"bottom left",
                    width: "auto",
                    display: "inline-block",
                    width: "10px",
                    // bottom: 0,
                    // left: "10px",
                  }}
                >
                  {proposition.shortTitle}
                </div>
              </th>
            ))}
            <th className="p-2 border">Total</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((leader, rIndex) => (
            <tr key={rIndex}>
              <td className="p-2 border font-medium flex items-center">
                {leader.ranking === 1 ? <IoTrophy /> : null}
                {leader.username}
              </td>
              <td className="p-2 border font-medium">
                <Ordinal number={leader.ranking} />
              </td>
              {leader.selections.map((selection, aIndex) => (
                <PropCell key={aIndex} option={options[selection.optionId]} />
              ))}
              <td className="p-2 border font-bold text-center">
                {leader.correct}
              </td>
            </tr>
          ))}
        </tbody>
        {/* <tfoot>
          <tr>
            <td className="p-2 border font-bold">Total Correct</td>
            {questions.map((_, qIndex) => (
              <td key={qIndex} className="p-2 border font-bold text-center">
                {
                  sortedRespondents.filter((r) => r.answers[qIndex].correct)
                    .length
                }
              </td>
            ))}
            <td className="p-2 border"></td>
          </tr>
        </tfoot> */}
      </table>
    </div>
  );
}
