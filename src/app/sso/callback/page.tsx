"use client";

import { LoadingIcon } from "@/app/_component/global-loading";
import { API } from "@/app/_lib/api";
import { AuthContext } from "@/app/_lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useContext, useLayoutEffect, useRef, useState } from "react";

function CallbackInner() {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

  const authContext = useContext(AuthContext);
  const router = useRouter();

  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const isAPICalledRef = useRef(false);
  useLayoutEffect(() => {
    if (code && !isAPICalledRef.current) {
      (async () => {
        try {
          isAPICalledRef.current = true;
          const api = await API.get();
          const token = await api.exchangeToken(code);
          authContext.setUser(await api.getUser(token));
          router.push("/");
        } catch (error: any) {
          setErrorMessage(error.toString());
        }
      })();
    }
  });

  return (
    <main className="flex flex-row items-center min-h-80 align-middle">
      {errorMessage ? (
        <div className="p-2 bg-red-500 text-white rounded-md">
          {errorMessage}
        </div>
      ) : (
        <LoadingIcon />
      )}
    </main>
  );
}

export default function Callback() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  );
}
