"use server";

export async function apiUrl() {
  return process.env.SSO_API_URL || "";
}

export async function redirectBaseUrl() {
  return process.env.REDIRECT_URL || "";
}
