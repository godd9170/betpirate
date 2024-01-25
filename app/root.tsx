import { json, LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  LiveReload,
  Outlet,
  Scripts,
  useLoaderData,
} from "@remix-run/react";
import { authenticator } from "./services/auth.server";
import stylesheet from "~/styles/tailwind.css";
import Logo from "./components/Logo";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const sailor = await authenticator.isAuthenticated(request);
  return json({ sailor });
};

// https://remix.run/docs/en/1.14.3/route/meta#md-global-meta
export default () => {
  const { sailor } = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Betpirate - Weekly Prop Sheets</title>
        <Meta />
        <Links />
      </head>
      <header className="flex">
        {sailor?.id && (
          <>
            <div className="flex-grow">
              <Logo height={40} />
            </div>
            <div className="text-slate self-center">👤 {sailor?.username}</div>
          </>
        )}
      </header>
      <body className="container mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50">
        <Outlet />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
};
