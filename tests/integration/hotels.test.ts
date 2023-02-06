import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
    createEnrollmentWithAddress,
    createUser,
    createTicket,
    createPayment,
    createTicketTypeforHotel,
    createTicketTypeforPaymentRequired,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
jest.useRealTimers();


beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/hotels");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {

        it("should respond with status 200 and with hotels data", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeforHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const newHotel = await prisma.hotel.create({
                data: {
                    name: "hotel marimar",
                    image: "https://blog.websocorro.com.br/wp-content/uploads/2021/01/banner1.jpg",
                }
            });
            const response = await server.get(`/hotels`).set("Authorization", `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toEqual([
                {
                    id: newHotel.id,
                    name: newHotel.name,
                    image: newHotel.image,
                    createdAt: newHotel.createdAt.toISOString(),
                    updatedAt: newHotel.createdAt.toISOString(),
                }
            ]);
        });

        it("should respond with status 404 and with no hotel data", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeforHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const response = await server.get(`/hotels`).set("Authorization", `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
            expect(response.body).toEqual([]);

        })
        it("should respond with status 402 with payment Required error", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeforPaymentRequired();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const response = await server.get(`/hotels`).set("Authorization", `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
            expect(response.body).toEqual([]);

        })
        it("should respond with status 404 when user doesn't have enrollment", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const ticketType = await createTicketTypeforHotel();
            const response = await server.get(`/hotels`).set("Authorization", `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
            expect(response.body).toEqual([]);

        })
    });


});

describe("GET /hotels/:hotelId", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/hotels/1");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {

        it("should respond with status 200 and with hotels data", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeforHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);

            const newHotel = await prisma.hotel.create({
                data: {
                    name: "hotel marimar",
                    image: "https://blog.websocorro.com.br/wp-content/uploads/2021/01/banner1.jpg",
                }
            });

            const room = await prisma.room.create({
                data: {
                    name: "ajauwidh",
                    capacity: 7,
                    hotelId: newHotel.id
                },
            });

            const response = await server.get(`/hotels/${newHotel.id}`).set("Authorization", `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toEqual(
                {
                    id: newHotel.id,
                    name: newHotel.name,
                    image: newHotel.image,
                    createdAt: newHotel.createdAt.toISOString(),
                    updatedAt: newHotel.createdAt.toISOString(),
                    Rooms: [
                        {
                            id: room.id,
                            name: room.name,
                            capacity: room.capacity,
                            hotelId: room.hotelId,
                            createdAt: room.createdAt.toISOString(),
                            updatedAt: room.createdAt.toISOString(),
                        }
                    ]
                }
            );
        });

        it("should respond with status 404 when no rooms are avaliable", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeforHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);

            const newHotel = await prisma.hotel.create({
                data: {
                    name: "hotel marimar",
                    image: "https://blog.websocorro.com.br/wp-content/uploads/2021/01/banner1.jpg",
                }
            });

            const response = await server.get(`/hotels/${newHotel.id}`).set("Authorization", `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        it("should respond with status 404 and with no hotel data", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeforHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const response = await server.get(`/hotels/`).set("Authorization", `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
            expect(response.body).toEqual([]);

        })

        it("should respond with status 402 with payment Required error", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeforPaymentRequired();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const response = await server.get(`/hotels/1`).set("Authorization", `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
            expect(response.body).toEqual([]);

        })

        it("should respond with status 404 when user doesn't have enrollment", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const ticketType = await createTicketTypeforHotel();
            const response = await server.get(`/hotels/1`).set("Authorization", `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
            expect(response.body).toEqual([]);

        })

        it("should respond with status 404 when hotelId doesn't exist", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeforHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const response = await server.get(`/hotels/9017313072032`).set("Authorization", `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
            expect(response.body).toEqual([]);

        })

    });

})
