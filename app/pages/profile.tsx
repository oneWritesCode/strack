import Footer from "../components/Footer";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Todos from "../components/Todos";
import { useTheme } from "@/app/context/ThemeContext";
import Graph from "../components/Graph";
import Navbar from "../components/Navbar";
import Link from "next/link";
import classnames from "classnames";

function Landing() {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [optimisticEmail, setOptimisticEmail] = useState<string | null>(null);
  const [optimisticName, setOptimisticName] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = Cookies.get("sk_user_email");
    const savedName = Cookies.get("sk_user_name");
    if (savedEmail) {
      setOptimisticEmail(savedEmail);
    }
    if (savedName) {
      setOptimisticName(savedName);
    }
  }, []);

  return (
    <div
      className={classnames(
        "relative w-full min-h-screen bg-(--background-color) text-foreground md:pt-0 pt-6 font-bubblegum",
        { "text-black": theme !== "black", "text-white": theme === "black" },
      )}
    >
      <div className="px-2 md:px-10 py-4 flex w-full items-center justify-center">
        <div className="w-full max-w-4xl">
          {/* <InstallPWA /> */}
          <Navbar />
          {/* top of the component */}
          <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-2 md:gap-4">
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-full flex items-center justify-center border-3 border-transparent">
                {/* {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? "User profile"}
                    className="rounded-full border-white border-3"
                  />
                ) : ( */}
                <div
                  className={classnames(
                    "min-w-16 min-h-16 md:min-w-22 md:min-h-22 rounded-full flex items-center justify-center overflow-hidden",
                  )}
                >
                  <img
                    src={
                      theme === "black"
                        ? "/images/alternateUserImageWhite.png"
                        : theme === "violet"
                          ? "/images/alternateUserImageBlack.png"
                          : "/images/alternateUserImage.png"
                    }
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* )} */}
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-bold text-lg text-foreground">
                  {session?.user?.name || optimisticName}
                </h3>
                <p className="text-xs font-semibold text-foreground/70">
                  {session?.user?.email || optimisticEmail}
                </p>
              </div>
            </div>
          </div>

          {/* bottom of the components */}
          <div>
            <Todos />
            <Graph />
          </div>
        </div>
      </div>
      {/* <Footer /> */}

      <footer className="w-full absolute bottom-0 bg-(--background-color) border-t-2border-black ">
        <div className="max-w-4xl mx-auto pb-10">
          <div className="mt-12 md:mt-16 pt-8 border-t-2 border-black/10 flex flex-col mdflex-row justify-between items-center gap-4">
            <p className="text-sm font-black uppercase">
              Created by{" "}
              <Link
                href="https://d33pak.space"
                className="text-(--light-background) underline"
                target="_blank"
              >
                Deepak
              </Link>{" "}
              @2026
            </p>
            <p className="text-xs font-bold text-muted-foreground uppercase opacity-50">
              © 2026 SkillTracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
