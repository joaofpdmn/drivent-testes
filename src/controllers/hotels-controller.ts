import hotelsService from "@/services/hotels-service";
import httpStatus from "http-status";
import { Request, Response } from "express";

export async function getAllHotels(req: Request, res: Response) {
    try {
        const allHotels = await hotelsService.getHotels();
        return res.status(httpStatus.OK).send(allHotels);
    } catch (error) {
        return res.status(httpStatus.NOT_FOUND).send({});
    }
}

export async function getHotelById(req: Request, res: Response) {
    const { hotelId } = req.params;
    if (!hotelId) { return res.sendStatus(400) };
    try {
        const hotel = await hotelsService.getHotelById(Number(hotelId));
        return res.send(hotel)
    } catch (error) {

    }
}