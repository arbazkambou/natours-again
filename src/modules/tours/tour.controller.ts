import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Tour } from "./tour.model.js";
import { allowedTourFilters, TourBody, TourQuery } from "./tour.schemas.js";
import { APIFeatures } from "#helpers/apiFeatures.js";

export async function getTours(req: Request, res: Response) {
  try {
    const queryData = req.validated?.query as TourQuery;

    const apiFeatures = new APIFeatures(Tour, queryData).filter(allowedTourFilters).limitFields();

    const { data: tours, pagination } = await apiFeatures.paginate();

    // //1.skip the pagination and sorting fileds and get filters
    // const { page, limit, sort, fields, ...filtersObj } = queryData;

    // //2.build filters
    // const filters = buildFilters(filtersObj, allowedTourFilters);

    // //3.build the query object by injecting filters
    // let query = Tour.find(filters);

    // //4. perform sorting if any
    // if (sort) {
    //   const sortBy = sort.replaceAll(",", " ");
    //   query = query.sort(sortBy);
    // }

    // //5. limiting the fields
    // if (fields) {
    //   const limitsByFields = fields.replaceAll(",", " ");
    //   query.select(limitsByFields);
    // } else {
    //   query.select("-__v");
    // }

    // //6. Pagination
    // const { data: tours, pagination } = await paginate(Tour, { query, limit, page, filters });

    return res.status(StatusCodes.OK).json({ status: true, data: { tours, pagination } });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ status: false, errors: error });
  }
}

export async function getTour(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const tour = await Tour.findById(id);

    if (!tour) {
      return res.status(StatusCodes.NOT_FOUND).json({ status: false, message: "No tour found with that id" });
    }

    return res.status(StatusCodes.OK).json({ status: true, data: { tour } });
  } catch (error) {
    return res.status(StatusCodes.NOT_FOUND).json({ status: false, errors: error });
  }
}

export async function createTour(req: Request, res: Response) {
  try {
    const newTour: TourBody = req.body;

    const createdTour = await Tour.create(newTour);

    return res.status(201).json({ status: true, data: { tour: createdTour } });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ status: false, errors: error });
  }
}

export async function updateTour(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;

    const tour = await Tour.findByIdAndUpdate(id, data, { runValidators: true, new: true });
    if (!tour) {
      return res.status(StatusCodes.NOT_FOUND).json({ status: false, message: "No tour found with that id" });
    }
    return res.status(StatusCodes.OK).json({ status: true, message: "patched", data: { tour } });
  } catch (error) {
    return res.status(StatusCodes.NOT_FOUND).json({ status: false, message: "patched failed", errors: error });
  }
}

export async function deleteTour(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const tour = await Tour.findByIdAndDelete(id);

    if (!tour) {
      res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "No Tour found with that ID",
      });
    }

    return res.status(StatusCodes.OK).json({ status: true, message: "Tour deleted successfully", data: { tour } });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Something went wrong", error });
  }
}
