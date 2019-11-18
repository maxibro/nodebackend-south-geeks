export interface IUser {
  id?: number;
  email: string;
  password: string;
  name: string;
  role?: UserType;
  orderNumber?: number;
  orders?: IOrder[];
  isActive?: boolean;
}

export interface IBook {
  id?: number;
  name: string;
  author: string;
  price: number;
  keywords?: string;
  txtFileUrl?: string;
  txtFileName?: string;
  isActive: boolean;
  order?: Promise<IOrder>;
}

export interface ITag {
  id?: number;
  name: string;
}

export interface IOrder {
  id?: number;
  orderDate: Date;
  amount: number;
  user: IUser;
  books?: IBook[];
}

export interface IJwtSession {
  sub: number;
  iat: number;
  exp: number;
  role: UserType;
}

export interface IPagination<PaginationObject> {
  readonly items: PaginationObject[];
  readonly itemCount: number;
  readonly totalItems: number;
  readonly pageCount: number;
  readonly next?: string;
  readonly previous?: string;
  readonly currentPage: number;
}

export interface IAdminSignIn {
  email: string;
  password: string;
}

export interface IRegularSignIn {
  email: string;
  password: string;
}

export interface IUserToken {
  token: string;
  role: UserType;
}

export interface IUpload {
  /** Name of the file on the user's computer */
  originalName: string;
  /** Encoding type of the file */
  encoding: string;
  /** Mime type of the file */
  mimeType: string;
  /** Size of the file in bytes */
  size: number;
  /** The folder to which the file has been saved (DiskStorage) */
  destination: string;
  /** The name of the file within the destination (DiskStorage) */
  filename: string;
  /** Location of the uploaded file (DiskStorage) */
  path: string;
}

export enum UserType {
  regular = "regular",
  admin = "admin"
}

/* 
  Path to redirect to the previous route
*/
export interface IRouteRedirect {
  redirectPath: string;
}
