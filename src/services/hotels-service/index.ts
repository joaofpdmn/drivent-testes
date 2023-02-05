import { notFoundError } from "@/errors";
import hotelRepository from "@/repositories/hotels-repository";

async function getHotels(){
    const hotels = await hotelRepository.findAllHotels();
    if(!hotels){
        throw notFoundError();
    }
    return hotels;
}

async function getHotelById(hotelId: number){
    const hotel = await hotelRepository.findHotelById(hotelId);
    if(!hotel){
        throw notFoundError();
    }
    return hotel;
}

const hotelsService = {
    getHotels,
    getHotelById
};


export default hotelsService;