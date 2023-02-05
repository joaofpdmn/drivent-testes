import { prisma } from "@/config";
import { Room } from "@prisma/client";

export async function findAllHotels(){
    return prisma.hotel.findMany();
}

export async function findHotelById(hotelId: number){
    return prisma.hotel.findFirst({
        where: {
            id: hotelId,
        }, include: {
            Rooms: true
        }
    });
}

export type hotelWithRoomsParams = Omit<Room, "Booking" | "Hotel">;

const hotelRepository = {
    findAllHotels,
    findHotelById
};

export default hotelRepository;