"use client";

import { User } from "./auth";
import { apiUrl } from "./server/api-url";

export interface UrlRedirectResponse {
  data: UrlRedirect[];
  last: string;
}

export interface UrlRedirect {
  id: string;
  key: string;
  target: string;
}

export class AuthorizationError extends Error {
  constructor() {
    super("Authorization error");
  }
}

export class AlreadyExistsError extends Error {
  constructor() {
    super("Already exists");
  }
}

class Api {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  public async exchangeToken(code: string): Promise<string> {
    const rawResponse = await fetch(this.url + "/auth/callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ authorization_code: code }),
    });

    checkResponse(rawResponse);

    const response = await rawResponse.json();
    return response.token_type + " " + response.access_token;
  }

  public async getUser(token: string): Promise<User> {
    const rawResponse = await fetch(this.url + "/me", {
      headers: {
        Authorization: token,
      },
    });

    checkResponse(rawResponse);

    const response = await rawResponse.json();
    return {
      token,
      email: response.email,
    };
  }

  public async getRedirects(
    token: string,
    params: { after?: string; limit?: number },
  ): Promise<UrlRedirectResponse> {
    const urlParams = {
      ...(params.after ? { after: params.after } : {}),
      ...(params.limit ? { limit: params.limit.toString() } : {}),
    };

    const paramString = new URLSearchParams(urlParams).toString();
    const rawResponse = await fetch(this.url + "/urls?" + paramString, {
      headers: {
        Authorization: token,
      },
    });

    checkResponse(rawResponse);

    return await rawResponse.json();
  }

  public async createRedirect(
    token: string,
    { key, target }: Omit<UrlRedirect, "id">,
  ): Promise<UrlRedirect> {
    const rawResponse = await fetch(this.url + "/urls", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key, target }),
    });

    checkResponse(rawResponse);

    return await rawResponse.json();
  }

  public async updateRedirect(token: string, { id, key, target }: UrlRedirect) {
    const rawResponse = await fetch(this.url + "/urls/" + id, {
      method: "PATCH",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key, target }),
    });

    checkResponse(rawResponse);
  }

  public async deleteRedirect(token: string, id: string) {
    const rawResponse = await fetch(this.url + "/urls/" + id, {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    });

    checkResponse(rawResponse);
  }
}

class ApiCache {
  private api?: Api;

  constructor() {
    this.api = undefined;
  }

  async get(): Promise<Api> {
    if (!this.api) {
      this.api = new Api(await apiUrl());
    }

    return this.api;
  }
}

export const API = new ApiCache();

function checkResponse(rawResponse: Response) {
  if (rawResponse.status == 401) {
    throw new AuthorizationError();
  }

  if (rawResponse.status == 409) {
    throw new AlreadyExistsError();
  }

  if (!rawResponse.ok) {
    throw new Error("api call failed with status " + rawResponse.status);
  }
}
