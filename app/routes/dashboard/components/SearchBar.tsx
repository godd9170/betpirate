import { IoSearch, IoClose } from "react-icons/io5";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search sailors...",
  className = "",
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        <IoSearch
          size={16}
          className="absolute left-3 text-base-content/60 pointer-events-none"
        />
        <input
          type="text"
          placeholder={placeholder}
          className="input input-sm input-bordered w-full pl-9 pr-8 bg-base-100"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            type="button"
            className="absolute right-1 btn btn-xs btn-ghost btn-circle"
            onClick={() => onChange("")}
            aria-label="Clear search"
          >
            <IoClose size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
