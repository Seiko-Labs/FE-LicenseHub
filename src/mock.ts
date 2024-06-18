export interface MockLicense {
  id: number;
  type: string;
  activationDate: Date;
  expirationDate: Date;
}

export interface MockCompany {
  id: number;
  name: string;
  package: string;
  licenses: MockLicense[];
}

export const mockLicenses: MockLicense[] = [
  {
    id: 1,
    type: "Basic",
    activationDate: new Date("2021-01-01"),
    expirationDate: new Date("2022-01-01"),
  },
  {
    id: 2,
    type: "Pro",
    activationDate: new Date("2021-01-01"),
    expirationDate: new Date("2022-01-01"),
  },
  {
    id: 3,
    type: "Enterprise",
    activationDate: new Date("2021-01-01"),
    expirationDate: new Date("2022-01-01"),
  },
];

export const mockCompanies: MockCompany[] = [
  {
    id: 1,
    name: "Company A",
    package: "Basic",
    licenses: [mockLicenses[0]],
  },
  {
    id: 2,
    name: "Company B",
    package: "Pro",
    licenses: [mockLicenses[1]],
  },
  {
    id: 3,
    name: "Company C",
    package: "Enterprise",
    licenses: [mockLicenses[2]],
  },
];
