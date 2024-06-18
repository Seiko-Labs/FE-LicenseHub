import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { getSavedToken, useToken } from "./service/user";
import { useForm } from "react-hook-form";
import { Credentials } from "./types";
import { toast } from "sonner";
import { useState } from "react";
import { useSWRConfig } from "swr";

export const SignInDialog = () => {
  const token = getSavedToken();

  const { trigger } = useToken();

  const form = useForm<Credentials>();

  const [open, setOpen] = useState(token === undefined);
  const conf = useSWRConfig();

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign in</DialogTitle>
          <DialogDescription>
            Sign in to your account to continue
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(async (data) => {
            trigger(data)
              .then(() => {
                conf.mutate("licenses");
                conf.mutate("companies");
                conf.mutate("packages");
                setOpen(false);
              })
              .catch((err) => {
                toast.error(err.message);
              });
          })}
        >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="username" className="text-right">
                Username
              </label>
              <Input
                {...form.register("username")}
                required
                id="username"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="password" className="text-right">
                Password
              </label>
              <Input
                {...form.register("password")}
                required
                id="password"
                name="password"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Sign in</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
