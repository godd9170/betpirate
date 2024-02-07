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
          src="https://media.canva.com/1/image-resize/1/800_670_100_PNG_F/czM6Ly9tZWRpYS1wcml2YXRlLmNhbnZhLmNvbS9tY24tby9NQUY4RHJtY24tby8xL3AucG5n?osig=AAAAAAAAAAAAAAAAAAAAANqSs9FZyxKsuGvgxy5TuyShPXMj1EZAMTp74JaJDtdD&exp=1707299776&x-canva-quality=screen&csig=AAAAAAAAAAAAAAAAAAAAABwzhztgd51sk0D6OhIramE-9yaBAfwBGD8_dkGM-gBQ"
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
