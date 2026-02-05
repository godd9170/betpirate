import { E164Number } from "libphonenumber-js";
import Input from "react-phone-number-input/input";
import { forwardRef, LegacyRef, ComponentPropsWithoutRef } from "react";
import { DefaultInputComponentProps } from "react-phone-number-input";

interface PhoneNumberComponentPropsWithoutRef
  extends Omit<ComponentPropsWithoutRef<"input">, "value" | "onChange"> {
  value: E164Number | undefined;
  onChange: (value?: E164Number | undefined) => void;
}

const InputComponent = forwardRef(
  (
    inputProps: DefaultInputComponentProps,
    ref: LegacyRef<HTMLInputElement>
  ) => (
    <input
      ref={ref}
      className="input w-full input-bordered placeholder:text-base-content/40 placeholder:italic"
      {...inputProps}
    />
  )
);

export default ({
  value,
  onChange,
  ...inputProps
}: PhoneNumberComponentPropsWithoutRef) => {
  return (
    <Input
      value={value}
      onChange={onChange}
      country="CA" // todo: prop
      inputComponent={InputComponent}
      {...inputProps}
    />
  );
};
