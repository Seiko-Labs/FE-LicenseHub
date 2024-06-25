import {
  CheckIcon,
  ChevronRight,
  EditIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Company,
  CreateCompanyRequest,
  EditCompanyRequest,
} from "@/service/companies";
import { FC, PropsWithChildren } from "react";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { PopoverClose, PopoverTrigger } from "@radix-ui/react-popover";
import { Popover, PopoverContent } from "./ui/popover";
import { ID } from "@/types";
import { Link } from "react-router-dom";
import {
  useCreateResource,
  useEditResource,
  useRemoveResource,
  useResources,
} from "@/hooks/use-resource";

interface CreateCompanyFormProps {
  defaultValues?: CreateCompanyRequest;
  onSubmit: (data: CreateCompanyRequest) => void;
}

const CreateCompanyForm: FC<CreateCompanyFormProps> = ({
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
      className="flex gap-2"
    >
      <Input
        placeholder="Company Name"
        autoComplete="name"
        {...register("name")}
      />

      <Button
        asChild
        className="rounded-2xl shrink-0 gap-2 bg-muted/40 text-white/40 hover:text-white"
        variant="secondary"
      >
        <PopoverClose type="submit">
          <CheckIcon className="size-4" />
        </PopoverClose>
      </Button>
    </form>
  );
};

interface ConfirmationDialogProps {
  onConfirm: () => void;
  message?: string;
}

export const ConfirmationDialog: FC<
  PropsWithChildren<ConfirmationDialogProps>
> = ({ message, children, onConfirm }) => (
  <Popover>
    <PopoverTrigger asChild>{children}</PopoverTrigger>
    <PopoverContent className="max-w-72 space-y-2">
      <div>
        <h1 className="font-light text-sm">Confirm the action</h1>
        <h2>{message}</h2>
      </div>

      <div className=" space-x-2">
        <Button
          className="rounded-full text-red-400 border border-red-400"
          variant="secondary"
          onClick={() => {
            onConfirm();
          }}
          asChild
        >
          <PopoverClose>Confirm</PopoverClose>
        </Button>
        <Button
          className="rounded-full text-white/80"
          variant="secondary"
          asChild
        >
          <PopoverClose>Cancel</PopoverClose>
        </Button>
      </div>
    </PopoverContent>
  </Popover>
);

const CreateCompanyPopover: FC<PropsWithChildren<CreateCompanyFormProps>> = ({
  children,
  ...props
}) => (
  <Popover>
    <PopoverTrigger asChild>{children}</PopoverTrigger>
    <PopoverContent>
      <CreateCompanyForm {...props} />
    </PopoverContent>
  </Popover>
);

export function Dashboard() {
  const { data } = useResources<Company>("clientcompanies");

  const { trigger: edit } = useEditResource<Company, EditCompanyRequest>(
    "clientcompanies",
  );
  const { trigger: create } = useCreateResource<Company, CreateCompanyRequest>(
    "clientcompanies",
  );
  const { trigger: remove } = useRemoveResource("clientcompanies");

  const sortById = (a: Company, b: Company) => a.id - b.id;

  const companies = data ? data.sort(sortById).reverse() : [];

  const handleCreate = async (data: CreateCompanyRequest) => {
    await create(data);
  };

  const handleEdit = async (data: CreateCompanyRequest & { id: ID }) => {
    await edit(data);
  };

  return (
    <>
      <CardHeader className="flex flex-row items-center">
        <CardTitle className="text-4xl">Companies</CardTitle>
        <div className="ml-auto flex gap-2">
          <CreateCompanyPopover onSubmit={handleCreate}>
            <Button size="icon">
              <PlusIcon className="size-4" />
            </Button>
          </CreateCompanyPopover>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {companies.map(({ id, name }) => (
          <div
            key={id}
            className="flex md:flex-row flex-col md:gap-2 gap-4 w-full md:rounded-full rounded-3xl md:items-center px-6 p-4 hover:bg-muted/20 bg-muted/10 border border-muted/20"
          >
            <p className="font-light tracking-widest text-nowrap overflow-hidden text-ellipsis capitalize">
              {name}
            </p>
            <div className="ml-auto flex items-center gap-2 justify-end">
              <CreateCompanyPopover
                onSubmit={(data) => handleEdit({ id, ...data })}
                defaultValues={{ name }}
              >
                <Button
                  className="rounded-full"
                  variant="secondary"
                  size="icon"
                >
                  <EditIcon className="size-4 text-white/50" />
                </Button>
              </CreateCompanyPopover>
              <ConfirmationDialog
                onConfirm={() => {
                  remove({ id });
                }}
                message={`Are you sure you want to remove ${name}?`}
              >
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                >
                  <TrashIcon className="size-4 text-red-400" />
                </Button>
              </ConfirmationDialog>

              <Link to={`/${id}/`}>
                <Button
                  variant="outline"
                  className="rounded-full gap-2 text-white/50 font-light"
                >
                  View packages
                  <ChevronRight className="size-5" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </>
  );
}
