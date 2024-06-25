import { ChevronLeft, EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FC, PropsWithChildren } from "react";
import { Input } from "./ui/input";
import { Controller, useForm } from "react-hook-form";
import {
  CreateLicenseRequest,
  EditLicenseRequest,
  License,
  LicenseType,
} from "@/service/licenses";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Badge } from "./ui/badge";
import { ID } from "@/types";
import { Link, useParams } from "react-router-dom";
import {
  useCreateResource,
  useEditResource,
  useRemoveResource,
  useResources,
} from "@/hooks/use-resource";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { ConfirmationDialog } from "./dashboard";

interface CreateLicenseFormProps {
  defaultValues?: CreateLicenseRequestForm;
  onSubmit: (data: CreateLicenseRequestForm) => void;
}

type CreateLicenseRequestForm = Omit<CreateLicenseRequest, "client_package">;

const CreateLicenseForm: FC<CreateLicenseFormProps> = ({
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
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="picture">Activation Date</Label>
        <Input
          id="picture"
          type="date"
          {...register("activation_date")}
          defaultValue={new Date().toLocaleDateString("fr-ca")}
        />
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="picture">Expiration Date</Label>
        <Input
          id="picture"
          type="date"
          defaultValue={new Date().toLocaleDateString("fr-ca")}
          {...register("expiration_date")}
        />
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="picture">Quantity</Label>
        <Input
          placeholder="Quantity"
          type="number"
          defaultValue={0}
          {...register("quantity")}
        />
      </div>

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
              className="text-sm"
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

      <Button variant="secondary" className="rounded-full" asChild>
        <PopoverClose type="submit">Confirm</PopoverClose>
      </Button>
    </form>
  );
};

const CreateLicensePopover: FC<PropsWithChildren<CreateLicenseFormProps>> = ({
  children,
  ...props
}) => (
  <Popover>
    <PopoverTrigger asChild>{children}</PopoverTrigger>
    <PopoverContent className="max-w-80 w-full">
      <CreateLicenseForm {...props} />
    </PopoverContent>
  </Popover>
);

export const Licenses: FC = () => {
  const { data } = useResources<License>("licenses");
  const { pkg: id } = useParams();

  const { trigger: create } = useCreateResource<License, CreateLicenseRequest>(
    "licenses",
  );
  const { trigger: edit } = useEditResource<License, EditLicenseRequest>(
    "licenses",
  );
  const { trigger: remove } = useRemoveResource("licenses");

  if (!id) return null;
  const sortById = (a: License, b: License) => a.id - b.id;

  const licenses = data ? data.sort(sortById).reverse() : [];

  const handleCreate = async (data: CreateLicenseRequestForm) => {
    await create({ ...data, client_package: Number(id) });
  };

  const handleEdit = async (data: CreateLicenseRequestForm & { id: ID }) => {
    await edit({ ...data, client_package: Number(id) });
  };

  const locale = navigator.language ?? "en-US";

  const fmt = (strDate: string) => {
    const date = new Date(strDate);

    return new Intl.DateTimeFormat(locale).format(date);
  };

  return (
    <>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle className="text-4xl flex items-center justify-center gap-4">
            <Link to={`/${id}`}>
              <Button variant="outline" size="icon" className="rounded-full">
                <ChevronLeft />
              </Button>
            </Link>
            Licenses
          </CardTitle>
        </div>
        <div className="ml-auto flex gap-2">
          <CreateLicensePopover onSubmit={handleCreate}>
            <Button size="icon">
              <PlusIcon className="size-4" />
            </Button>
          </CreateLicensePopover>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {licenses.map(
          ({ id, quantity, activation_date, type, expiration_date }) => (
            <div
              key={id}
              className="flex w-full items-center bg-gradient-to-r from-muted/20 to-muted/30 rounded-3xl bg-muted/10 text-sm border border-muted/20 flex-wrap p-2"
            >
              <div className="flex gap-1 flex-wrap">
                <Badge variant="secondary" className="uppercase">
                  {type}
                </Badge>
                <Badge variant="secondary">
                  Active from {fmt(activation_date)} to {fmt(expiration_date)}
                </Badge>

                <Badge variant="secondary">Quantitiy: {quantity}</Badge>
              </div>
              <div className="ml-auto flex items-center gap-2 justify-end">
                <CreateLicensePopover
                  onSubmit={(data) => {
                    handleEdit({ ...data, id });
                  }}
                  defaultValues={{
                    quantity,
                    type,
                    activation_date,
                    expiration_date,
                  }}
                >
                  <Button
                    className="rounded-full"
                    variant="secondary"
                    size="icon"
                  >
                    <EditIcon className="size-4 text-white/50" />
                  </Button>
                </CreateLicensePopover>

                <ConfirmationDialog
                  onConfirm={() => {
                    remove({ id });
                  }}
                  message={`Are you sure you want to remove this license?`}
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
          ),
        )}
      </CardContent>
    </>
  );
};
