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
      className="pl-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6"
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
