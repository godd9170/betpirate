import { ComponentPropsWithoutRef } from "react";

// // if we ever want special props
// export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
//   specialProp?: string;
// }

export default ({ children, ...props }: ComponentPropsWithoutRef<"button">) => {
  return (
    <button
      {...props}
      className="rounded-md bg-slate-600 py-2.5 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
    >
      {children}
    </button>
  );
};
