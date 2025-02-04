import { Form } from "@remix-run/react";
import { E164Number, isPossiblePhoneNumber } from "libphonenumber-js";
import { useState } from "react";
import PhoneNumberInput from "~/components/PhoneNumberInput";

export default function PhoneNumberForm({ error }: { error: any }) {
  const [phone, setPhone] = useState<E164Number | undefined>(undefined);
  return (
    <div className="card bg-base-200 card-compact w-96">
      <div className="card-body">
        <div className="card-title">Superbowl LIX</div>
        <div>
          {JSON.stringify(error)}
          <Form
            action="/login?index"
            method="post"
            className="flex flex-col space-y-4"
          >
            <div>
              <ul>
                <li>
                  ✔ <strong>$10.00</strong> per sheet
                </li>
                <li>
                  ✔ <strong>26</strong> Prop Questions
                </li>
                <li>
                  ✔ <strong>1</strong> Winner
                </li>
              </ul>
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
                Let's Go!
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
