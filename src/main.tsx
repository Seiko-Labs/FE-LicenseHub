import React from "react";
import ReactDOM from "react-dom/client";
import { SWRConfig } from "swr";
import "./index.css";
import { Dashboard } from "./components/dashboard";
import { Route, Switch } from "wouter";
import { Packages } from "./components/packages";
import { Licenses } from "./components/licenses";
import { Toaster } from "sonner";
import { SignInDialog } from "./sign-in-dialog";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SWRConfig
      value={{
        provider: () => new Map(),
      }}
    >
      <SignInDialog />
      <div className="h-screen sm:py-10 flex items-center dark justify-center">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/:id/p">
            {({ id }) => <Packages id={Number(id)} />}
          </Route>
          <Route path="/:id/p/:pkg">
            {({ pkg }) => <Licenses id={Number(pkg)} />}
          </Route>
        </Switch>
      </div>
      <Toaster theme="dark" />
    </SWRConfig>
  </React.StrictMode>,
);
