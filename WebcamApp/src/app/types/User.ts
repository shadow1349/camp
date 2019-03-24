export interface Permissions {
  user: boolean;
  authorized: boolean;
  admin: boolean;
}

export interface AppUser {
  Id: string;
  Email: string;
  Permissions: Permissions;
  FirstName?: string;
  LastName?: string;
  CreatedOn: Date;
}
