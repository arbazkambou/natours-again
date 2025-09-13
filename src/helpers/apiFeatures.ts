import { Model, Query, Document } from "mongoose";

export interface PaginationResult {
  page: number;
  limit: number;
  totalPages: number;
  totalDocs: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
}

export class APIFeatures<T> {
  public query: Query<T[], T>;
  private queryString: Record<string, any>;
  private model: Model<T>;
  private filters: Record<string, any> = {};

  constructor(model: Model<T>, queryString: Record<string, any>, query?: Query<T[], T>) {
    this.query = query ?? model.find();
    this.queryString = queryString;
    this.model = model;
  }

  filter(allowedFilters: string[]): this {
    // Return 'this' for proper chaining types
    const { page, limit, sort, fields, ...filterObj } = this.queryString;

    const operatorMap: Record<string, string> = {
      gt: "$gt",
      gte: "$gte",
      lt: "$lt",
      lte: "$lte",
      ne: "$ne",
      eq: "$eq",
    };

    const filters: Record<string, any> = {};

    for (const key in filterObj) {
      if (!allowedFilters.includes(key)) {
        continue;
      }

      const value = filterObj[key];

      if (typeof value === "object") {
        filters[key] = {};
        for (const op in value) {
          if (operatorMap[op]) {
            filters[key][operatorMap[op]] = isNaN(Number(value[op])) ? value[op] : Number(value[op]);
          }
        }
      } else {
        filters[key] = isNaN(Number(value)) ? value : Number(value);
      }
    }

    this.query.find(filters);
    this.filters = filters;
    return this;
  }

  sort(): this {
    // Return 'this'
    const { sort } = this.queryString;

    if (sort) {
      const sortBy = sort.replaceAll(",", " ");
      this.query = this.query.sort(sortBy);
    }

    return this;
  }

  limitFields(): this {
    // Return 'this'
    const { fields } = this.queryString;

    if (fields) {
      const limitsByFields = fields.replaceAll(",", " ");
      this.query.select(limitsByFields);
    } else {
      this.query.select("-__v");
    }

    return this;
  }

  async paginate(): Promise<{ data: T[]; pagination: PaginationResult }> {
    const { limit = 10, page = 1 } = this.queryString;

    const skip = (page - 1) * limit;

    const [docs, totalDocs] = await Promise.all([this.query.skip(skip).limit(limit), this.model.countDocuments(this.filters)]);

    const totalPages = Math.ceil(totalDocs / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    const nextPage = hasNextPage ? page + 1 : null;
    const previousPage = hasPreviousPage ? page - 1 : null;

    return {
      data: docs,
      pagination: {
        hasNextPage,
        hasPreviousPage,
        limit,
        nextPage,
        page,
        previousPage,
        totalDocs,
        totalPages,
      },
    };
  }

  // Add this method to execute the query directly
  async exec(): Promise<T[]> {
    return await this.query.exec();
  }
}
