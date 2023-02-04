import hotelsService from "@/services/hotels-service";
import httpStatus from "http-status";
import { Request, Response } from "express";

export async function getAllHotels(req: Request, res: Response){
    try {
        const allHotels = await hotelsService.getHotels();
        return res.status(httpStatus.OK).send(allHotels);
    } catch (error) {
        return res.status(httpStatus.NOT_FOUND).send({});
    }
}