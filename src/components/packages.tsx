import { FC, PropsWithChildren } from "react";
import { Controller, useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Calendar } from "./ui/calendar";
import { ChevronRight, EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  CreatePackageRequest,
  Package,
  useCreatePackage,
  useDeletePackage,
  useEditPackage,
  usePackages,
} from "@/service/packages";
import { ID } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

interface CreatePackageRequestForm
  extends Omit<CreatePackageRequest, "client" | "expiration_date"> {
  expiration_date: Date;
}

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
        placeholder="Hardware ID"
        autoComplete="name"
        {...register("hardware_id")}
      />

      <div className="space-y-2 border-muted border rounded-md">
        <Badge className="m-2">Expiration Date</Badge>
        <Controller
          control={form.control}
          name="expiration_date"
          render={({ field: { value, onChange } }) => (
            <Calendar
              mode="single"
              className="rounded-md"
              selected={value}
              onSelect={onChange}
            />
          )}
        />
      </div>

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

      <Button>Confirm</Button>
    </form>
  );
};

const CreatePackagePopover: FC<PropsWithChildren<CreatePackageFormProps>> = ({
  children,
  ...props
}) => (
  <Dialog>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="w-fit">
      <CreatePackageForm {...props} />
    </DialogContent>
  </Dialog>
);

interface Params {
  id: ID;
}

export const Packages: FC<Params> = ({ id }) => {
  const { data } = usePackages();

  const { trigger: create } = useCreatePackage();
  const { trigger: edit } = useEditPackage();
  const { trigger: remove } = useDeletePackage();

  const sortById = (a: Package, b: Package) => a.id - b.id;

  const packages = data ? data.sort(sortById).reverse() : [];

  const locale = navigator.language ?? "en-US";

  const fmt = (strDate: string) => {
    const date = new Date(strDate);

    return new Intl.DateTimeFormat(locale).format(date);
  };

  const handleCreate = async (data: CreatePackageRequestForm) => {
    const iso = data.expiration_date.toISOString().slice(0, 10);

    void create({
      client: id,
      hardware_id: data.hardware_id,
      expiration_date: iso,
      flag: data.flag,
    });
  };

  const handleEdit = async (data: CreatePackageRequestForm & { id: ID }) => {
    const iso = data.expiration_date.toISOString().slice(0, 10);

    void edit({
      client: id,
      id: data.id,
      hardware_id: data.hardware_id,
      expiration_date: iso,
      flag: data.flag,
    });
  };

  return (
    <Card className="xl:col-span-2 w-full max-w-xl h-full overflow-auto">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Packages</CardTitle>
          <CardDescription>
            Manage your packages, add, remove and edit them.
          </CardDescription>
        </div>
        <div className="ml-auto flex gap-2">
          <CreatePackagePopover onSubmit={handleCreate}>
            <Button size="icon">
              <PlusIcon className="size-4" />
            </Button>
          </CreatePackagePopover>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hardware ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="font-medium">
                    {p.hardware_id.length ? p.hardware_id : "No hardware ID"}
                  </div>
                  <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
                    <Badge>
                      Active from {fmt(p.created_at)} to{" "}
                      {fmt(p.expiration_date)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right flex items-center gap-2 justify-end">
                  <CreatePackagePopover
                    onSubmit={(data) => handleEdit({ ...data, id: p.id })}
                    defaultValues={{
                      hardware_id: p.hardware_id,
                      expiration_date: new Date(p.expiration_date),
                      flag: p.flag,
                    }}
                  >
                    <Button variant="outline" size="icon">
                      <EditIcon className="size-4" />
                    </Button>
                  </CreatePackagePopover>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => remove({ id: p.id })}
                  >
                    <TrashIcon className="size-4" />
                  </Button>

                  <Link href={`/${id}/p/${p.id}`}>
                    <Button variant="outline" size="icon">
                      <ChevronRight className="size-5" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
