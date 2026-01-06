"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
        
        <Link href="/" className="text-xl font-bold">
          TaskHub
        </Link>

        <nav className="flex items-center gap-4">

          {status === "loading" && <div>...</div>}

          {!session && status === "unauthenticated" && (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Register
              </Link>
            </>
          )}

          {session && (
            <>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}