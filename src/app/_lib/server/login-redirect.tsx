"use server";

import { redirect } from "next/navigation";

export default async function login_redirect() {
  const client_id = process.env.SSO_CLIENT_ID;
  const redirect_uri = process.env.SSO_REDIRECT_URI;

  const login_url =
    "https://sso.v2.agus.dev/oauth2/login?client_id=" +
    client_id +
    "&redirect_uri=" +
    redirect_uri;

  redirect(login_url);
}
