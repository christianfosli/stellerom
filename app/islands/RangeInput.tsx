import { useState } from "preact/hooks";

export interface RangeInputProps {
  label: string;
  min: number;
  max: number;
  startValue: number;
  name: string;
  required: boolean;
}

export default function RangeInput(
  { label, min, max, startValue, name, required }: RangeInputProps,
) {
  const [value, setValue] = useState(startValue);

  // TODO: I couldnt find a InputChangeEvent
  // deno-lint-ignore no-explicit-any
  const handleChange = (evt: any) => {
    setValue(evt.target.value);
  };

  return (
    <>
      <label class="block text-md font-bold" for={`RangeInput-${name}-inp`}>
        {label}
      </label>
      <div class="flex flex-row justify-between">
        <input
          class="w-5/6"
          type="range"
          value={value}
          min={min}
          max={max}
          name={name}
          id={`RangeInput-${name}-inp`}
          required={required}
          onInput={handleChange}
        />
        <span class="text-md">{value}/{max}</span>
      </div>
    </>
  );
}
