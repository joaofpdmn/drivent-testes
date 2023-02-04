import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getAllHotels } from "@/controllers/hotels-controller";

const hotelsRouter = Router();

hotelsRouter
    .get('/', getAllHotels);

export { hotelsRouter };


