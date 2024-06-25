import { FC, PropsWithChildren, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  CheckIcon,
  ChevronLeft,
  ClipboardIcon,
  EditIcon,
  EyeIcon,
  PlusIcon,
  SettingsIcon,
  TrashIcon,
  X,
} from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  CreatePackageRequest,
  EditPackageRequest,
  Package,
} from "@/service/packages";
import { ID } from "@/types";
import { Badge } from "./ui/badge";
import { Link, useParams } from "react-router-dom";
import { PopoverContent, PopoverTrigger, Popover } from "./ui/popover";
import { useGenerateKey } from "@/service/licenses";
import { toast } from "sonner";
import {
  useCreateResource,
  useEditResource,
  useRemoveResource,
  useResources,
} from "@/hooks/use-resource";
import { PopoverClose } from "@radix-ui/react-popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ConfirmationDialog } from "./dashboard";

type CreatePackageRequestForm = Omit<CreatePackageRequest, "client">;

interface CreatePackageFormProps {
  defaultValues?: CreatePackageRequestForm;
  onSubmit: (data: CreatePackageRequestForm) => void;
}

const CreatePackageForm: FC<CreatePackageFormProps> = ({
  defaultValues,
  onSubmit,
}) => {
  const form = useForm({
    defaultValues,
  });

  const { handleSubmit, register } = form;

  return (
    <form
      onSubmit={(e) => {
        handleSubmit(onSubmit)(e);
      }}
      className="space-y-4"
    >
      <Input
        placeholder="Package name"
        autoComplete="name"
        {...register("name")}
      />
      <Input
        placeholder="Hardware ID"
        autoComplete="name"
        {...register("hardware_id")}
      />

      <Controller
        control={form.control}
        name="flag"
        render={({ field: { value, onChange } }) => (
          <div className="flex items-center space-x-2">
            <Checkbox id="flag" checked={value} onCheckedChange={onChange} />
            <label
              htmlFor="flag"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Use hardware id
            </label>
          </div>
        )}
      />

      <Button variant="secondary" className="rounded-full" asChild>
        <PopoverClose type="submit">Confirm</PopoverClose>
      </Button>
    </form>
  );
};

const CreatePackagePopover: FC<PropsWithChildren<CreatePackageFormProps>> = ({
  children,
  ...props
}) => (
  <Popover>
    <PopoverTrigger asChild>{children}</PopoverTrigger>
    <PopoverContent className="w-fit">
      <CreatePackageForm {...props} />
    </PopoverContent>
  </Popover>
);

const CreateHashDialog: FC<PropsWithChildren<{ hash: string }>> = ({
  children,
  hash,
}) => {
  return (
    <>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-fit">
        <DialogTitle>Hash code</DialogTitle>
        <span className=" w-full break-all max-w-60 max-h-60 overflow-auto p-4 rounded-2xl bg-muted/40 bg-gradient-to-r from-muted/30 to-muted/10 text-sm text-white/70">
          {hash}
        </span>

        <DialogFooter>
          <Button
            variant="secondary"
            className="gap-4 text-white/80 rounded-full"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(hash).then(() => {
                toast("Copied!");
              });
            }}
          >
            Copy to clipboard <ClipboardIcon className="size-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </>
  );
};

export const Packages: FC = () => {
  const { id } = useParams();
  const { data } = useResources<Package>("clientpackages");

  const [dialogOpen, setDialogOpen] = useState<ID | null>(null);
  const { trigger: generateKey } = useGenerateKey();

  const { trigger: create } = useCreateResource<Package, CreatePackageRequest>(
    "clientpackages",
  );
  const { trigger: edit } = useEditResource<Package, EditPackageRequest>(
    "clientpackages",
  );
  const { trigger: remove } = useRemoveResource(
    `clientpackages?client_company_id=${id}`,
  );

  if (!id) return null;

  const sortById = (a: Package, b: Package) => a.id - b.id;

  const packages = data ? data.sort(sortById).reverse() : [];

  const locale = navigator.language ?? "en-US";

  const fmt = (strDate: string) => {
    const date = new Date(strDate);

    return new Intl.DateTimeFormat(locale).format(date);
  };

  const handleCreate = async (data: CreatePackageRequestForm) => {
    void create({
      ...data,
      client: Number(id),
    });
  };

  const handleEdit = async (data: CreatePackageRequestForm & { id: ID }) => {
    void edit({
      ...data,
      client: Number(id),
    });
  };

  return (
    <>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle className="text-4xl flex items-center justify-center gap-4">
            <Link to="/">
              <Button variant="outline" size="icon" className="rounded-full">
                <ChevronLeft />
              </Button>
            </Link>
            Packages
          </CardTitle>
        </div>
        <div className="ml-auto flex gap-2">
          <CreatePackagePopover onSubmit={handleCreate}>
            <Button size="icon">
              <PlusIcon className="size-4" />
            </Button>
          </CreatePackagePopover>
        </div>
      </CardHeader>
      <CardContent className="w-full space-y-2">
        {packages.map((p) => (
          <div
            className="w-full h-full bg-muted/10 text-sm flex-wrap border-muted/20 border rounded-3xl sm:grid flex flex-col grid-cols-2 gap-2 shrink-0 p-4"
            style={{
              gridTemplateColumns: "1fr 1fr",
            }}
            key={p.id}
          >
            <div className="flex flex-1 flex-col gap-2  h-full overflow-hidden">
              <div className="bg-muted/30 w-full flex gap-2 items-center h-fit p-2 font-light rounded-2xl">
                <p className="tracking-wider overflow-hidden text-nowrap text-ellipsis">
                  Package {p.name}
                </p>
              </div>

              <div className="relative border border-muted overflow-hidden w-full  size-10 flex gap-2 items-center h-full flex-1 font-light rounded-2xl">
                <span className="absolute w-full break-all text-[8px] uppercase leading-3 text-white/10">
                  {p.hash_code}
                </span>
                {p.hash_code ? (
                  <Dialog
                    open={dialogOpen === p.id}
                    onOpenChange={(open) => {
                      if (!open) setDialogOpen(null);
                      else {
                        setDialogOpen(p.id);
                      }
                    }}
                  >
                    <CreateHashDialog hash={p.hash_code}>
                      <Button
                        variant="secondary"
                        className="w-full h-full font-light tracking-widest gap-2 z-50 bg-muted/10 p-2 flex items-center"
                      >
                        Hash code <EyeIcon className="size-4" />
                      </Button>
                    </CreateHashDialog>
                  </Dialog>
                ) : (
                  <span className="w-full h-full flex items-center justify-center px-4 text-xs text-center">
                    Generate key to view hash code
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 items-stretch flex-col ">
              <div className="flex gap-2 items-stretch">
                <div className="bg-muted/30 w-full flex flex-col gap-1 h-fit p-2 font-light rounded-2xl">
                  <p className="tracking-wider">Hardware</p>

                  <Badge className="w-fit">ID: {p.id}</Badge>

                  <Badge className="flex gap-1 w-fit tracking-wide items-center">
                    {p.flag ? (
                      <>
                        Using
                        <CheckIcon className="size-4" />
                      </>
                    ) : (
                      <>
                        Not used
                        <X className="size-4" />
                      </>
                    )}
                  </Badge>
                </div>

                <div className="bg-gradient-to-r from-muted/60 to-muted/20  flex w-full h-full flex-col gap-1 p-2 font-light rounded-2xl">
                  <p className="tracking-wider">Created at</p>
                  <Badge className="mt-auto">{fmt(p.created_at)}</Badge>
                </div>
              </div>
              <div className="mt-auto ml-auto flex gap-2 sm:flex-nowrap flex-wrap">
                <Button
                  className="rounded-full gap-2 text-white/50 font-light"
                  variant="outline"
                  onClick={() => {
                    generateKey({ package_id: Number(p.id) }).then(() => {
                      toast.success("Key generated successfully ");

                      setDialogOpen(p.id);
                    });
                  }}
                >
                  Generate key
                </Button>
                <Link to={`/${id}/${p.id}`}>
                  <Button
                    className="rounded-full gap-2 text-white/50 font-light"
                    variant="outline"
                  >
                    Manage licenses
                    <SettingsIcon className="size-4 text-white/50" />
                  </Button>
                </Link>
                <CreatePackagePopover
                  onSubmit={(data) => handleEdit({ ...data, id: p.id })}
                  defaultValues={{
                    hardware_id: p.hardware_id,
                    flag: p.flag,
                    name: p.name,
                  }}
                >
                  <Button
                    className="rounded-full"
                    variant="secondary"
                    size="icon"
                  >
                    <EditIcon className="size-4 text-white/50" />
                  </Button>
                </CreatePackagePopover>

                <ConfirmationDialog
                  onConfirm={() => {
                    remove({ id: p.id });
                  }}
                  message={`Are you sure you want to remove package ${p.name}?`}
                >
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full"
                  >
                    <TrashIcon className="size-4 text-red-400" />
                  </Button>
                </ConfirmationDialog>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </>
  );
};
