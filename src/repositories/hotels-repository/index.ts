import { prisma } from "@/config";

export async function findAllHotels(){
    return prisma.hotel.findMany();
}

const hotelRepository = {
    findAllHotels,
};

export default hotelRepository;