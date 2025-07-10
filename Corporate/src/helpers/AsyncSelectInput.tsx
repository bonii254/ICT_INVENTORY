import Select from "react-select";
import type { FieldApi } from "@tanstack/react-form";

type Option = {
  label: string;
  value: number;
};

type AnyField = FieldApi<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

interface AsyncSelectInputProps {
  className?: string;
  field: AnyField;
  options: Option[];
  placeholder?: string;
  label?: string;
  isSearchable?: boolean;
  maxVisible?: number;
}

const AsyncSelectInput = ({
  field,
  options,
  className = "",
  placeholder = "Select...",
  label,
  isSearchable = true,
  maxVisible = 8, // 👈 Default to 8
}: AsyncSelectInputProps) => {
  const selectedOption = options.find(
    (option) => option.value === field.state.value,
  );

  const customFilterOption = (candidate: Option, input: string) => {
    if (!input) {
      const index = options.findIndex((opt) => opt.value === candidate.value);
      return index > -1 && index < maxVisible;
    }
    return true;
  };

  return (
    <div className={className}>
      {label && <label className="form-label">{label}</label>}
      <Select
        classNamePrefix="react-select"
        value={selectedOption || null}
        options={options}
        onChange={(selected: Option | null) => {
          field.handleChange(selected?.value ?? 0);
        }}
        placeholder={placeholder}
        isClearable
        isSearchable={isSearchable}
        filterOption={customFilterOption}
        menuPlacement="auto"
        menuShouldScrollIntoView={false}
      />
      {field.state.meta.errors && field.state.meta.isTouched && (
        <div className="text-danger small">{field.state.meta.errors}</div>
      )}
    </div>
  );
};

export default AsyncSelectInput;
