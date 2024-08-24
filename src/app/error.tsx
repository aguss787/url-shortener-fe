"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./_lib/auth";
import { AuthorizationError } from "./_lib/api";
import { usePathname, useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const authContext = useContext(AuthContext);
  const router = useRouter();

  if (error instanceof AuthorizationError) {
    authContext.setUser(undefined);
  } else {
    throw error;
  }

  const pathname = usePathname();

  const [sec, setSec] = useState(5);
  useEffect(() => {
    if (sec <= 0) {
      if (pathname == "/") {
        reset();
      } else {
        router.push("/");
      }

      return;
    }

    setTimeout(() => {
      setSec(sec - 1);
    }, 1000);
  }, [pathname, sec, reset, router]);

  return (
    <div className="flex flex-col items-center divide-y-10">
      <h1 className="block">Authorization Error</h1>
      <p className="block">Your session has expired. Please login again.</p>
      <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700 w-full" />
      <p className="block">You will be redirected to home page in {sec}.</p>
    </div>
  );
}
