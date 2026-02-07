"use client";

import { signIn } from "next-auth/react";
import InstallPWA from "./InstallPWA";

function LoginPage() {
  return (
    <div className="w-full min-h-screen bg-[#8B5CF6] flex items-center justify-center flex-col text-white overflow-hidden">
      <div className="flex flex-col w-full items-center gap-3 md:gap-4 justify-center font-bubblegum font-light">
        <div>
          <img src="/login-page-image.png" alt="" className="md:scale-115" />
        </div>

        <button
          className="pl-2 pr-10 py-2 rounded-xl border-3 border-black bg-white cursor-pointer group hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] shadow-[6px_6px_2px_3px_rgba(0,0,0,0.3)] capitalize flex items-center gap-4 font-bold transition-all duration-100 z-1000"
          onClick={() => signIn("google")}
        >
          <img src="/images/GoogleLogo.png" alt="logo" className="w-6 h-6" />
          <span className="transition-all text-black sm:text-xl">
            Sign in with Google
          </span>
        </button>

        <div className="cursor-pointer z-1000">
          <InstallPWA forLogin={true} />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
