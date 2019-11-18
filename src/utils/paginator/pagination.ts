import { IPagination } from "@models";

export class Pagination<PaginationObject>
  implements IPagination<PaginationObject> {
  constructor(
    public readonly items: PaginationObject[],
    public readonly itemCount: number,
    public readonly totalItems: number,
    public readonly pageCount: number,
    public readonly currentPage: number,
    public readonly next?: string,
    public readonly previous?: string
  ) {}
}
