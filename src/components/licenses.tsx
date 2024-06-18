import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChangeEvent, FC, PropsWithChildren } from "react";
import { Input } from "./ui/input";
import { Controller, useForm } from "react-hook-form";
import {
  CreateLicenseRequest,
  License,
  LicenseType,
  useCreateLicense,
  useDeleteLicense,
  useEditLicense,
  useGenerateKey,
  useLicenses,
} from "@/service/licenses";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Calendar } from "./ui/calendar";
import { Badge } from "./ui/badge";
import { ID } from "@/types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

interface CreateLicenseFormProps {
  defaultValues?: CreateLicenseRequestForm;
  onSubmit: (data: CreateLicenseRequestForm) => void;
}

interface CreateLicenseRequestForm
  extends Omit<CreateLicenseRequest, "client_package" | "expiration_date"> {
  expiration_date: Date;
}

const CreateLicenseForm: FC<CreateLicenseFormProps> = ({
  defaultValues,
  onSubmit,
}) => {
  const form = useForm({
    defaultValues,
  });

  const { handleSubmit } = form;

  return (
    <form
      onSubmit={(e) => {
        handleSubmit(onSubmit)(e);
      }}
      className="space-y-4"
    >
      <Controller
        control={form.control}
        name="quantity"
        render={({ field: { value, onChange } }) => {
          return (
            <Input
              placeholder="Quantity"
              value={value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.value === "") {
                  onChange("");
                  return;
                }
                const v = parseInt(e.target.value);
                if (isNaN(v)) return;
                if (v < 0) return;

                onChange(v);
              }}
            />
          );
        }}
      />

      <Controller
        control={form.control}
        name="type"
        defaultValue={LicenseType.ATTENDED}
        render={({ field: { value, onChange } }) => {
          return (
            <RadioGroup
              value={value}
              onValueChange={onChange}
              defaultValue={LicenseType.ATTENDED}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={LicenseType.ATTENDED} id="r1" />
                <label htmlFor="r1">Attended</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={LicenseType.UNATTENDED} id="r2" />
                <label htmlFor="r2">Unattended</label>
              </div>
            </RadioGroup>
          );
        }}
      />

      <div className="space-y-2 border-muted border rounded-md">
        <Badge className="m-2">Expiration Date</Badge>
        <Controller
          control={form.control}
          name="expiration_date"
          render={({ field: { value, onChange } }) => (
            <Calendar
              mode="single"
              className="rounded-md border"
              selected={value}
              onSelect={onChange}
            />
          )}
        />
      </div>

      <Button>Confirm</Button>
    </form>
  );
};

const CreateLicensePopover: FC<PropsWithChildren<CreateLicenseFormProps>> = ({
  children,
  ...props
}) => (
  <Dialog>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="w-fit">
      <CreateLicenseForm {...props} />
    </DialogContent>
  </Dialog>
);

interface LicensesProps {
  id: number;
}

export const Licenses: FC<LicensesProps> = ({ id }) => {
  const { data } = useLicenses();

  const { trigger: create } = useCreateLicense();
  const { trigger: edit } = useEditLicense();
  const { trigger: remove } = useDeleteLicense();
  const { trigger: generateKey } = useGenerateKey();

  const sortById = (a: License, b: License) => a.id - b.id;

  const licenses = data ? data.sort(sortById).reverse() : [];

  const handleCreate = async (data: CreateLicenseRequestForm) => {
    const iso = data.expiration_date.toISOString().slice(0, 10);

    await create({ ...data, client_package: id, expiration_date: iso });
  };

  const handleEdit = async (data: CreateLicenseRequestForm & { id: ID }) => {
    const iso = data.expiration_date.toISOString().slice(0, 10);

    await edit({ ...data, client_package: id, expiration_date: iso });
  };

  const locale = navigator.language ?? "en-US";

  const fmt = (strDate: string) => {
    const date = new Date(strDate);

    return new Intl.DateTimeFormat(locale).format(date);
  };

  return (
    <div className="relative h-full w-full max-w-xl">
      <Card
        className="xl:col-span-2 w-full max-w-xl max-h-[calc(100% - 5rem)] relative h-full overflow-auto"
        style={{ height: "calc(100% - 6rem)" }}
      >
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Licenses</CardTitle>
            <CardDescription>
              <span className="text-muted-foreground">
                Manage your licenses
              </span>
            </CardDescription>
          </div>
          <div className="ml-auto flex gap-2">
            <CreateLicensePopover onSubmit={handleCreate}>
              <Button size="icon">
                <PlusIcon className="size-4" />
              </Button>
            </CreateLicensePopover>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map(
                ({ id, quantity, type, created_at, expiration_date }) => (
                  <TableRow key={id}>
                    <TableCell>
                      <div className="font-medium uppercase">{type}</div>
                      <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
                        <Badge>
                          Active from {fmt(created_at)} to{" "}
                          {fmt(expiration_date)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{quantity}</TableCell>
                    <TableCell className="text-right flex items-center gap-2 justify-end">
                      <CreateLicensePopover
                        onSubmit={(data) => {
                          handleEdit({ ...data, id });
                        }}
                        defaultValues={{
                          quantity,
                          type,
                          expiration_date: new Date(expiration_date),
                        }}
                      >
                        <Button variant="outline" size="icon">
                          <EditIcon className="size-4" />
                        </Button>
                      </CreateLicensePopover>
                      <Button
                        onClick={() => {
                          remove({ id });
                        }}
                        variant="destructive"
                        size="icon"
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CardFooter className="mt-auto w-full border-muted border h-20 shrink-0 bg-black rounded-md absolute bottom-0">
        <Button
          onClick={(e) => {
            const target = e.target as HTMLButtonElement;
            target.disabled = true;
            generateKey({ package_id: id }).then(() => {
              toast.success("Key generated successfully ");
            });

            setTimeout(() => {
              target.disabled = false;
            }, 1000);
          }}
        >
          Generate key
        </Button>
      </CardFooter>
    </div>
  );
};
