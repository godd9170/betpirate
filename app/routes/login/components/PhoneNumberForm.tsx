import { Form } from "@remix-run/react";
import {
  E164Number,
  isPossibleNumber,
  isPossiblePhoneNumber,
} from "libphonenumber-js";
import { useState } from "react";
import Button from "~/components/Button";
import Logo from "~/components/Logo";
import PhoneNumberInput from "~/components/PhoneNumberInput";

export default ({ error }: { error: any }) => {
  const [phone, setPhone] = useState<E164Number | undefined>("");
  return (
    <>
      {/* <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <Logo height={80} />
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Ahoy Matey!
          </h2>
          <p>
            We be needin' yer number to start. Once you've won all the booty it
            be where we send the e-transfer. Ye be getting this link to yer
            pocket computer, and you can fill in yer sheet there.
          </p>
        </div>
      </div> */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {JSON.stringify(error)}
          <Form className="space-y-6" action="/login?index" method="post">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Phone Number
              </label>
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
              <Button
                disabled={!isPossiblePhoneNumber(phone || "")}
                type="submit"
              >
                Get me link
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};
