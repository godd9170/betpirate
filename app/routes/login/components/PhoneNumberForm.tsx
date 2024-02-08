import { Form } from "@remix-run/react";
import { E164Number, isPossiblePhoneNumber } from "libphonenumber-js";
import { useState } from "react";
import Logo from "~/components/Logo";
import PhoneNumberInput from "~/components/PhoneNumberInput";

export default function PhoneNumberForm({ error }: { error: any }) {
  const [phone, setPhone] = useState<E164Number | undefined>("");
  return (
    <>
      <div className="py-10 flex flex-col items-center justify-items-center w-full">
        <h1 className="text-xl font-black pb-4">Superbowl Prop Picks</h1>
        <img
          className="rounded"
          src="https://raw.githubusercontent.com/godd9170/betpirate/master/assets/img/Bet%20Pirate%20Promo.png"
        />
      </div>
      <div>
        <div>
          {JSON.stringify(error)}
          <Form
            action="/login?index"
            method="post"
            className="flex flex-col space-y-4"
          >
            <div>
              <label htmlFor="phone">Enter your phone number to begin</label>
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
                Text me!
              </button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}
