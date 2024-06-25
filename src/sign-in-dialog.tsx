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
import { useToken } from "./service/user";
import { useToken as useTokenContext } from "@/hooks/use-token";
import { useForm } from "react-hook-form";
import { Credentials } from "./types";
import { toast } from "sonner";
import { useResources } from "./hooks/use-resource";

export const SignInDialog = () => {
  const { trigger } = useToken();
  const tokenContext = useTokenContext();

  const { mutate: c } = useResources("clientcompanies");

  const { mutate: p } = useResources("clientpackages");

  const { mutate: l } = useResources("clientlicenses");

  const form = useForm<Credentials>();

  return (
    <Dialog open={!tokenContext?.token}>
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
              .then((t) => {
                tokenContext?.setToken(t);
                c();
                p();
                l();
              })
              .catch((err) => {
                toast.error(err.message);
              });
          })}
        >
          <div className="grid gap-4 py-4">
            <div className="sm:grid space-y-2 grid-cols-4 items-center gap-4">
              <label
                htmlFor="username"
                className="text-right text-sm font-light"
              >
                Username
              </label>
              <Input
                {...form.register("username")}
                required
                autoComplete="username"
                id="username"
                className="col-span-3"
              />
            </div>
            <div className="sm:grid space-y-2 grid-cols-4 items-center gap-4">
              <label
                htmlFor="password"
                className="text-right text-sm font-light"
              >
                Password
              </label>
              <Input
                {...form.register("password")}
                required
                id="password"
                autoComplete="current-password"
                type="password"
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
