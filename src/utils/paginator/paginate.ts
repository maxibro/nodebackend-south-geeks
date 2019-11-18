import {
  Repository,
  FindConditions,
  FindManyOptions,
  SelectQueryBuilder,
  getRepository
} from "typeorm";
import { Pagination } from "./pagination";
import { IPaginationOptions } from "./interfaces";

async function paginate<T>(
  repository: Repository<T>,
  options: IPaginationOptions,
  searchOptions?: FindManyOptions<T>
): Promise<Pagination<T>> {
  const page = options.page > 0 ? options.page - 1 : 0;
  const limit = options.limit;
  const route = options.route;

  delete options.page;
  delete options.limit;
  delete options.route;

  const [items, total] = await repository.findAndCount({
    skip: page * limit,
    take: limit,
    ...(searchOptions as object)
  });

  const isNext = route && total / limit >= page + 1;
  const isPrevious = route && page > 0;
  const routes = {
    next: isNext ? `${route}/${page + 2}` : "",
    previous: isPrevious ? `${route}/${page}` : ""
  };

  return new Pagination(
    items,
    items.length,
    total,
    Math.ceil(total / limit),
    page + 1,
    routes.next,
    routes.previous
  );
}

async function paginateQueryBuilder<T>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions
): Promise<Pagination<T>> {
  const page = options.page > 0 ? options.page - 1 : 0;
  const limit = options.limit;
  const route = options.route;

  delete options.page;
  delete options.limit;
  delete options.route;

  const [items, total] = await queryBuilder
    .skip(page * limit)
    .take(limit)
    .getManyAndCount();

  const isNext = route && total / limit >= page + 1;
  const isPrevious = route && page > 0;
  const routes = {
    next: isNext ? `${route}/${page + 2}` : "",
    previous: isPrevious ? `${route}/${page}` : ""
  };

  return new Pagination(
    items,
    items.length,
    total,
    Math.ceil(total / limit),
    page,
    routes.next,
    routes.previous
  );
}

async function paginateRawQuery<T>(
  entityName: string,
  selectQueryString: string,
  fromQueryString: string,
  queryFilters: any[],
  options: IPaginationOptions
): Promise<Pagination<T>> {
  const page = options.page > 0 ? options.page - 1 : 0;
  const limit = options.limit;
  const route = options.route;

  delete options.page;
  delete options.limit;
  delete options.route;

  const offset = limit * page;

  const totalItems = await getRepository(entityName).query(
    "SELECT 1  ".concat(fromQueryString),
    queryFilters
  );
  console.log("totalItems", totalItems);
  const total = totalItems.length;
  console.log("total", total);
  const items = await getRepository(entityName).query(
    selectQueryString.concat(fromQueryString).concat(" LIMIT ?,?"),
    [...queryFilters, offset, limit]
  );

  const isNext = route && total / limit >= page + 1;
  const isPrevious = route && page > 0;
  const routes = {
    next: isNext ? `${route}/${page + 2}` : "",
    previous: isPrevious ? `${route}/${page}` : ""
  };

  return new Pagination(
    items,
    items.length,
    total,
    Math.ceil(total / limit),
    page + 1,
    routes.next,
    routes.previous
  );
}

export { paginate, paginateQueryBuilder, paginateRawQuery };
