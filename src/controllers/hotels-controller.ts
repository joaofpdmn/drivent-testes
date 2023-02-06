import hotelsService from "@/services/hotels-service";
import httpStatus from "http-status";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";

export async function getAllHotels(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    try {
        const allHotels = await hotelsService.getHotels(Number(userId));
        return res.status(httpStatus.OK).send(allHotels);
    } catch (error) {
        if (error.name === "NotFoundError") {
            return res.status(httpStatus.NOT_FOUND).send([]);
        }
        return res.status(httpStatus.PAYMENT_REQUIRED).send([]);
    }
}

export async function getHotelById(req: AuthenticatedRequest, res: Response) {
    const { hotelId } = req.params
    const { userId } = req;
    try {
        const hotel = await hotelsService.getHotelById(Number(hotelId), Number(userId));
        return res.status(httpStatus.OK).send(hotel);
    } catch (error) {
        if (error.name === "NotFoundError") {
            return res.status(httpStatus.NOT_FOUND).send([]);
        }
        if(error.name === "NoRoomsAvaliable"){
            return res.status(httpStatus.NOT_FOUND).send({});
        }
        return res.status(httpStatus.PAYMENT_REQUIRED).send([]);
    }
}