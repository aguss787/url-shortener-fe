"use client";

import Link from "next/link";
import { AuthContext } from "../_lib/auth";
import { useContext } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import login_redirect from "../_lib/server/login-redirect";

export default function Headers() {
  const authContext = useContext(AuthContext);

  const authButtonClass =
    "inline-flex items-center gap-2 rounded-md bg-gray-800 pb-1 px-2";

  const Login = () => (
    <div>
      <button
        className={authButtonClass}
        onClick={async () => await login_redirect()}
      >
        Login
      </button>
    </div>
  );

  const Logout = ({ email }: { email: string }) => (
    <Menu>
      <MenuButton className={authButtonClass}>
        {email} <ChevronDownIcon className="size-4 fill-white/60" />
      </MenuButton>
      <MenuItems anchor="bottom end" className="mt-2 rounded-md bg-gray-800">
        <MenuItem>
          <button
            onClick={() => authContext.setUser(undefined)}
            className="block p-2 data-[focus]:bg-gray-900"
          >
            Logout
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  );

  return (
    <div className="p-1 flex flex-row w-full content-between items-center sticky top-0 bg-black">
      <Link href="https://agus.dev" className="p-1 py-2">
        agus.dev
      </Link>
      <div className="p-1 ml-auto">
        {authContext.user ? (
          <Logout email={authContext.user?.email} />
        ) : (
          <Login />
        )}
      </div>
    </div>
  );
}
