export type Permissions = {
  user: boolean;
  authorized: boolean;
  admin: boolean;
};

export interface User {
  Id: string;
  Email: string;
  Permissions: Permissions;
  FirstName?: string;
  LastName?: string;
  CreatedOn: Date;
}
