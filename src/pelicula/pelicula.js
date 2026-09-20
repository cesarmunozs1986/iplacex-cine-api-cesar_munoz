import { ObjectId } from "mongodb";

export const Pelicula = {
    _id: ObjectId,
    nombre: String,
    generos: Array,
    anioEstreno: Number
};
