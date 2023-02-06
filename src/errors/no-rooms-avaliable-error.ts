import { ApplicationError } from "@/protocols";

export function noRoomsAvaliable(): ApplicationError {
  return {
    name: "NoRoomsAvaliable",
    message: "No Rooms Avaliable!",
  };
}
