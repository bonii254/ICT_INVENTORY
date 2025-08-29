import React from "react";
import Select from "react-select";

type Option = {
  label: string;
  value: number;
};

interface AsyncSelectInputProps {
  className?: string;
  field: any;
  options: Option[];
  placeholder?: string;
  label?: string;
  isSearchable?: boolean;
  maxVisible?: number;
  onFocus?: () => void;
}

const AsyncSelectInput: React.FC<AsyncSelectInputProps> = ({
  field,
  options,
  className = "",
  placeholder = "Select...",
  label,
  isSearchable = true,
  maxVisible = 8,
  onFocus,
}) => {
  const sortedOptions = [...options].sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  const selectedOption = sortedOptions.find(
    (opt) => opt.value === field.state.value,
  );

  const customFilterOption = (
    candidate: { label: string; value: number },
    input: string,
  ): boolean => {
    if (!input) return true;
    const normalizedInput = input.toLowerCase();
    return candidate.label.toLowerCase().includes(normalizedInput);
  };

  const getFilteredLimitedOptions = (inputValue: string): Option[] => {
    const filtered = sortedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(inputValue.toLowerCase()),
    );
    return filtered.slice(0, maxVisible);
  };

  return (
    <div className={className}>
      {/* ✅ Conditionally render internal label only if provided */}
      {label && <label className="form-label">{label}</label>}

      <Select
        classNamePrefix="react-select"
        value={selectedOption || null}
        placeholder={placeholder}
        isClearable
        isSearchable={isSearchable}
        onChange={(selected: Option | null) =>
          field.handleChange(selected?.value ?? 0)
        }
        filterOption={customFilterOption}
        options={sortedOptions}
        maxMenuHeight={240}
      />

      {/* ✅ Error message if field is touched */}
      {field.state.meta.errors && field.state.meta.isTouched && (
        <div className="text-danger small">{field.state.meta.errors}</div>
      )}
    </div>
  );
};

export default AsyncSelectInput;
