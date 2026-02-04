import { json, LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { authenticator } from "./services/auth.server";
import stylesheet from "~/styles/tailwind.css";
import { readSailor } from "./models/sailor.server";
import { Sailor } from "@prisma/client";
import { themeBootstrapScript } from "~/utils/theme";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

const emptySailor: Sailor = {
  id: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  username: null,
  phone: "",
  firstName: null,
  lastName: null,
  profilePictureUrl: null,
  admin: false,
};

// maybe we should use a root sailor if we end up requesting it everywhere
// https://www.jacobparis.com/content/remix-route-loader-data
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request);
  if (!sailorId) return json({ sailor: emptySailor }); // return empty sailor if none
  const sailor = await readSailor(sailorId);
  return json({ sailor });
};

// https://remix.run/docs/en/1.14.3/route/meta#md-global-meta
export default function Root() {
  return (
    <html lang="en" data-theme="lemonade" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,minimum-scale=1,viewport-fit=cover"
        />
        <title>Bet Pirate - Superbowl LIX Prop Sheet</title>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <Meta />
        <Links />
      </head>
      <body className="bg-base-100">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
