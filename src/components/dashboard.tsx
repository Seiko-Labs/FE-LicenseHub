import { ChevronRight, EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from "./ui/badge";
import { Link } from "wouter";
import {
  Company,
  CreateCompanyRequest,
  useCompanies,
  useCreateCompany,
  useDeleteCompany,
  useEditCompany,
} from "@/service/companies";
import { FC, PropsWithChildren } from "react";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Popover, PopoverContent } from "./ui/popover";
import { ID } from "@/types";

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
      className="space-y-4"
    >
      <Input
        placeholder="Company Name"
        autoComplete="name"
        {...register("name")}
      />

      <Button>Confirm</Button>
    </form>
  );
};

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

const useCompaniesAPI = () => {
  const { data } = useCompanies();

  const { trigger: edit } = useEditCompany();
  const { trigger: create } = useCreateCompany();
  const { trigger: remove } = useDeleteCompany();

  const sortById = (a: Company, b: Company) => a.id - b.id;

  const companies = data ? data.sort(sortById).reverse() : [];

  return { companies, edit, create, remove };
};

export function Dashboard() {
  const { companies, edit, create, remove } = useCompaniesAPI();

  const handleCreate = async (data: CreateCompanyRequest) => {
    await create(data);
  };

  const handleEdit = async (data: CreateCompanyRequest & { id: ID }) => {
    await edit(data);
  };

  const handleDelete = async (id: ID) => {
    await remove({ id });
  };

  return (
    <Card className="xl:col-span-2 w-full max-w-xl h-full overflow-auto">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Companies</CardTitle>
          <CardDescription>Manage your companies and licenses</CardDescription>
        </div>
        <div className="ml-auto flex gap-2">
          <CreateCompanyPopover onSubmit={handleCreate}>
            <Button size="icon">
              <PlusIcon className="size-4" />
            </Button>
          </CreateCompanyPopover>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map(({ id, name, partner }) => (
              <TableRow key={id}>
                <TableCell>
                  <div className="font-medium">{name}</div>
                  <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
                    Partner
                    <Badge>{partner}</Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right flex items-center gap-2 justify-end">
                  <CreateCompanyPopover
                    onSubmit={(data) => handleEdit({ id, ...data })}
                    defaultValues={{ name }}
                  >
                    <Button variant="outline" size="icon">
                      <EditIcon className="size-4" />
                    </Button>
                  </CreateCompanyPopover>
                  <Button
                    onClick={() => {
                      handleDelete(id);
                    }}
                    variant="destructive"
                    size="icon"
                  >
                    <TrashIcon className="size-4" />
                  </Button>

                  <Link href={`/${id}/p`}>
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
}
