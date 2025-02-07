import { Form } from "@remix-run/react";
import { E164Number, isPossiblePhoneNumber } from "libphonenumber-js";
import { useState } from "react";
import Logo from "~/components/Logo";
import PhoneNumberInput from "~/components/PhoneNumberInput";

export default function PhoneNumberForm({ error }: { error: any }) {
  const [phone, setPhone] = useState<E164Number | undefined>(undefined);
  return (
    <div className="card card-compact w-96">
      <div className="card-body">
        <div>
          {JSON.stringify(error)}
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
              <div className="text-center text-lg font-extrabold">
                Superbowl LIX Prop Sheet
              </div>
              <div className="divider" />
              <p className="text-center">
                Enter your phone number to get started
              </p>
              <div className="mt-2">
                <PhoneNumberInput
                  placeholder="(416)-867-5309"
                  value={phone}
                  onChange={setPhone}
                  name="phone"
                />
              </div>
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
    </div>
  );
}
