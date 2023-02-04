import { notFoundError } from "@/errors";
import hotelRepository from "@/repositories/hotels-repository";

async function getHotels(){
    const hotels = await hotelRepository.findAllHotels();
    if(!hotels){
        throw notFoundError();
    }
    return hotels;
}

const hotelsService = {
    getHotels,
};

export default hotelsService;