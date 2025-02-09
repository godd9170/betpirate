interface OrdinalProps {
  number: number;
}

export default function Ordinal({ number }: OrdinalProps) {
  if (typeof number !== "number" || !Number.isInteger(number)) {
    return <span>Invalid number</span>;
  }

  const getOrdinalSuffix = (n: number) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  };

  return (
    <span>
      {number}
      <sup>{getOrdinalSuffix(number)}</sup>
    </span>
  );
}
