import { Form } from "@remix-run/react";
import { E164Number, isPossiblePhoneNumber } from "libphonenumber-js";
import { useState } from "react";
import Logo from "~/components/Logo";
import PhoneNumberInput from "~/components/PhoneNumberInput";

export default function PhoneNumberForm({
  error,
  sheetTitle,
}: {
  error?: { message?: string } | null;
  sheetTitle?: string | null;
}) {
  const [phone, setPhone] = useState<E164Number | undefined>(undefined);
  return (
    <div className="card card-sm w-96 max-w-[90vw]">
      <div className="card-body">
        {error?.message ? (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error.message}
          </div>
        ) : null}
        <Form
          action="/login?index"
          method="post"
          className="flex flex-col space-y-4"
        >
          <div>
            <div className="flex justify-center">
              <Logo size="80px" />
            </div>
            <div className="text-center text-2xl font-extrabold">
              Welcome to BetPirate!
            </div>
            {sheetTitle ? (
              <div className="text-center text-lg font-extrabold">
                {sheetTitle}
              </div>
            ) : null}
            <div className="divider" />
            <p className="text-center">Enter your phone number to get started</p>
            <label className="mt-2 block text-sm font-semibold">
              Phone number
              <div className="mt-1">
                <PhoneNumberInput
                  placeholder="Phone number"
                  value={phone}
                  onChange={setPhone}
                  name="phone"
                />
              </div>
            </label>
          </div>
          <div>
            <button
              className="btn btn-primary w-full"
              disabled={!isPossiblePhoneNumber(phone || "")}
              type="submit"
            >
              Set Sail
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
