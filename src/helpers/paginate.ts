import { HydratedDocument, Model } from "mongoose";

type PaginateOptions = {
  limit?: number;
  page?: number;
  filters?: Record<string, any>;
  query?: ReturnType<Model<any>["find"]>;
};

interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalDocs: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage: number | null;
    previousPage: number | null;
  };
}

export async function paginate<T>(model: Model<T>, options?: PaginateOptions): Promise<PaginationResult<T>> {
  const { limit = 10, filters = {}, page = 1, query } = options ?? {};

  //1. build a base query
  const baseQuery = query ?? model.find(filters);

  //2. pagination work
  const skip = (page - 1) * limit;
  const [docs, totalDocs] = await Promise.all([baseQuery.skip(skip).limit(limit), model.countDocuments(filters)]);

  const totalPages = Math.ceil(totalDocs / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  const nextPage = hasNextPage ? page + 1 : null;
  const previousPage = hasPreviousPage ? page - 1 : null;

  return {
    data: docs as T[],
    pagination: { page, limit, totalPages, totalDocs, hasNextPage, hasPreviousPage, nextPage, previousPage },
  };
}
