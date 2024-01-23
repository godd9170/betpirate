import { Form } from "@remix-run/react";
import Logo from "~/components/Logo";

export default () => (
  <>
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Logo height={80} />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Ahoy Matey!
        </h2>
        <p>
          We be needin' yer number to start. Once you've won all the booty it be
          where we send the e-transfer. Ye be getting this link to yer pocket
          computer, and you can fill in yer sheet there.
        </p>
      </div>
    </div>
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <Form className="space-y-6" action="/login" method="post">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Phone Number
            </label>
            <div className="mt-2">
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="phone"
                required
                className="pl-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-slate-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
            >
              Get me link
            </button>
          </div>
        </Form>
      </div>
    </div>
  </>
);
