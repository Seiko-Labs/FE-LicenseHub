import { useLocation, useRoutes } from "react-router-dom";
import { Dashboard } from "./components/dashboard";
import { Packages } from "./components/packages";
import { Licenses } from "./components/licenses";
import { SWRConfig } from "swr";
import { SignInDialog } from "./sign-in-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ComponentProps, cloneElement } from "react";
import { Toaster } from "sonner";
import { LogOutIcon } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { useToken } from "./hooks/use-token";

const MotionCard = motion<ComponentProps<typeof Card>>(Card);

export const App = () => {
  const element = useRoutes([
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "/:id/",
      element: <Packages />,
    },

    {
      path: "/:id/:pkg",
      element: <Licenses />,
    },
  ]);

  const location = useLocation();

  const tokenContext = useToken();

  if (!element) return null;
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
      }}
    >
      {!tokenContext?.token ? <SignInDialog /> : null}
      <div className="sm:py-10 h-screen overflow-hidden flex items-center dark justify-center">
        <div className="max-w-2xl w-full h-full rounded-3xl border border-muted relative">
          <AnimatePresence mode="wait">
            <MotionCard
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="xl:col-span-2 border-0 pb-14  w-full max-w-2xl h-full overflow-auto"
            >
              {cloneElement(element, { key: location.pathname })}
            </MotionCard>
          </AnimatePresence>
          <Button
            className="absolute bottom-0 rounded-full m-4 right-0"
            size="icon"
            onClick={() => {
              tokenContext?.setToken(null);
            }}
            variant="destructive"
          >
            <LogOutIcon className="size-4" />
          </Button>
        </div>
      </div>
      <Toaster theme="dark" />
    </SWRConfig>
  );
};
