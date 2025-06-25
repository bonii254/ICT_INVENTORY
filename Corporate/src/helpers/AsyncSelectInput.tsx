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
  maxVisible?: number; // 👈 New prop: control initial visible items
}

const AsyncSelectInput = ({
  field,
  options,
  className = "",
  placeholder = "Select...",
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
      <label className="form-label">{placeholder}</label>
      <Select
        classNamePrefix="react-select"
        value={selectedOption || null}
        options={options}
        onChange={(selected: Option | null) => {
          field.handleChange(selected?.value ?? 0);
        }}
        placeholder={placeholder}
        isClearable
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
