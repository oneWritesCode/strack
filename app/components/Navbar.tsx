"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Cookies from "js-cookie";
import InstallPWA from "./InstallPWA";
import { useTheme } from "@/app/context/ThemeContext";
import classname from "classnames";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [optimisticEmail, setOptimisticEmail] = useState<string | null>(null);
  const [optimisticName, setOptimisticName] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Check for cookie on mount
    const savedEmail = Cookies.get("sk_user_email");
    const savedName = Cookies.get("sk_user_name");
    if (savedEmail) {
      setOptimisticEmail(savedEmail);
    }
    if (savedName) {
      setOptimisticName(savedName);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      Cookies.set("sk_user_email", session.user.email, { expires: 7 });
    }
    if (session?.user?.name) {
      Cookies.set("sk_user_name", session.user.name, { expires: 7 });
    }
  }, [session]);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const getLinkClasses = (linkPath: string) => {
    const isActive = pathname === linkPath;
    return classname(
      "flex items-center gap-3 rounded-xl transition-all cursor-pointer border-2",
      {
        "bg-(--light-background) text-(--background-color) border-(--light-background)":
          isActive,
        "text-(--text-color) border-(--text-color) hover:border-(--light-background) hover:bg-(--light-background) hover:text-(--background-color)":
          !isActive,
      },
    );
  };

  return (
    <>
      {/* Mobile Hamburger Trigger - Visible when closed */}
      <button
        onClick={toggleNavbar}
        className={classname(
          "fixed top-3 left-3 md:top-4 md:left-4 p-1 group rounded-md backdrop-blur-sm hover:bg-white/10 transition-all duration-500 cursor-pointer flex flex-col z-1000",
          {
            "opacity-0 pointer-events-none": isOpen,
            "opacity-100": !isOpen,
          },
        )}
        aria-label="Open Menu"
      >
        <div className="w-2 border-2 rounded-full border-(--text-color) group-hover:w-4 transition-all duration-400"></div>
        <div className="w-4 border-2 rounded-full border-(--text-color) group-hover:w-3 transition-all duration-400 my-0.5"></div>
        <div className="w-3 border-2 rounded-full border-(--text-color) group-hover:w-5 transition-all duration-400"></div>
      </button>

      {/* Overlay for mobile/desktop when open */}
      <div
        className={classname(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          {
            "opacity-100 pointer-events-auto": isOpen,
            "opacity-0 pointer-events-none": !isOpen,
          },
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <nav
        className={classname(
          "fixed top-0 left-0 h-full max-w-full w-80 bg-(--nav-background-color) shadow-2xl z-50 transform transition-transform duration-500 ease-in-out text-foreground font-bubblegum",
          {
            "translate-x-0": isOpen,
            "-translate-x-full": !isOpen,
            "bg-black": theme === "black",
          },
        )}
      >
        <div className="flex flex-col h-full p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h2 className="text-xl font-bold text-(--text-color) uppercase">
              SkillTracker
            </h2>
            <button
              onClick={toggleNavbar}
              className="p-3 group relative cursor-pointer"
            >
              <div className="w-4 group-hover:w-3 group-hover:-rotate-45 group-hover:top-2 group-hover:left-1 absolute right-1 top-2.5 rotate-45 border-2 rounded-full border-(--text-color) transition-all duration-400"></div>
              <div className="w-4 group-hover:w-3 group-hover:rotate-45 group-hover:top-4 group-hover:left-1 absolute right-1 top-2.5 -rotate-45 border-2 rounded-full border-(--text-color) transition-all duration-400"></div>
            </button>
          </div>

          {/* User Profile Section */}
          <div className="flex gap-2 md:mb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center border-3 border-transparent">
              <div className="min-w-16 min-h-16 md:min-w-22 md:min-h-22 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src={
                    theme === "black"
                      ? "/images/alternateUserImageWhite.png"
                      : theme === "violet"
                        ? "/images/alternateUserImageBlack.png"
                        : theme === "rose"
                          ? "/images/alternateUserImageGirl.png"
                          : "/images/alternateUserImage.png"
                  }
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="font-bold text-lg text-(--text-color)">
                {session?.user?.name || optimisticName || "User"}
              </h3>
              <p className="text-xs font-semibold text-(--text-color)/70">
                {session?.user?.email || optimisticEmail || ""}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 space-y-2">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={classname(
                "flex items-center gap-3 rounded-xl transition-all cursor-pointer border-2",
                {
                  "bg-(--light-background) text-(--background-color) border-(--light-background)":
                    pathname === "/",
                  "bg-white text-black border-white":
                    pathname === "/" && theme === "black",
                  "text-(--text-color) border-(--text-color) hover:bg-white hover:text-black hover:border-white":
                    pathname !== "/",
                },
              )}
            >
              <button className="w-full py-2 px-4 rounded-xl transition-all text-sm font-bold cursor-pointer">
                home
              </button>
            </Link>

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className={classname(
                "flex items-center gap-3 rounded-xl transition-all cursor-pointer border-2",
                {
                  "bg-(--light-background) text-(--background-color) border-(--light-background)":
                    pathname === "/profile",
                  "bg-white text-black border-white":
                    pathname === "/profile" && theme === "black",
                  "text-(--text-color) border-(--text-color) hover:border-white hover:bg-white hover:text-black":
                    pathname !== "/profile",
                },
              )}
            >
              <button className="w-full py-2 px-4 rounded-xl transition-all text-sm font-bold cursor-pointer">
                View Profile
              </button>
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className={classname(
                "flex items-center gap-3 rounded-xl transition-all cursor-pointer border-2",
                {
                  "bg-(--light-background) text-(--background-color) border-(--light-background)":
                    pathname === "/dashboard",
                  "bg-white text-black border-white":
                    pathname === "/dashboard" && theme === "black",
                  "text-(--text-color) border-(--text-color) hover:border-white hover:bg-white hover:text-black":
                    pathname !== "/dashboard",
                },
              )}
            >
              <button className="w-full py-2 px-4 rounded-xl transition-all text-sm font-bold cursor-pointer">
                Dashboard
              </button>
            </Link>
          </div>

          <div className="cursor-pointer">
            <InstallPWA />
          </div>

          {/* Logout Button */}
          <div className="mt-auto">
            <button
              className="inline-flex items-center gap-3 px-4 py-2 w-full rounded-xl bg-[#D73535] text-white transition-all font-bold cursor-pointer hover:bg-[#B72525]"
              title="logout"
              onClick={() => {
                Cookies.remove("sk_user_email");
                Cookies.remove("sk_user_name");
                signOut();
              }}
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
