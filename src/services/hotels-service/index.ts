import { noRoomsAvaliable, notFoundError, paymentRequired } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotels-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getHotels(userId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) {
        throw notFoundError();
    }
    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket || ticket.status === "RESERVED" || !ticket.TicketType.includesHotel || ticket.TicketType.isRemote) {
        throw paymentRequired();
    }
    const hotels = await hotelRepository.findAllHotels();
    if (hotels.length===0) {
        throw notFoundError();
    }
    return hotels;
}

async function getHotelById(hotelId: number, userId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) {
        throw notFoundError();
    }
    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket || ticket.status === "RESERVED" || !ticket.TicketType.includesHotel || ticket.TicketType.isRemote) {
        throw paymentRequired();
    }
    const hotel = await hotelRepository.findHotelById(hotelId);
    if (!hotel) {
        throw notFoundError();
    }
    if (!hotel.Rooms.length){
        throw noRoomsAvaliable();
    }
    return hotel;
}

const hotelsService = {
    getHotels,
    getHotelById
};


export default hotelsService;