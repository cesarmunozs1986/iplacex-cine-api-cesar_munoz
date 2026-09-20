import { ObjectId } from "mongodb";
import client from "../common/db.js";
import { Actor } from "./actor.js";
import { peliculaCollection } from "../pelicula/controller.js";

const actorCollection = client.db("cine-db").collection("actores");

async function handleInsertActorRequest(req, res) {
    const body = req.body;


    let peliculaOid;
    try {
        peliculaOid = ObjectId.createFromHexString(body.idPelicula);
    } catch (e) {
        return res.status(400).json({ message: "idPelicula mal formado" });
    }

    let peliculaExiste;
    try {
        peliculaExiste = await peliculaCollection.findOne({ _id: peliculaOid });
    } catch (e) {
        return res.status(500).json({ message: "Error al validar la película", error: e.message });
    }

    if (!peliculaExiste) {
        return res.status(404).json({ message: "La película indicada no existe" });
    }

    const actor = { ...Actor };
    actor.idPelicula = body.idPelicula;
    actor.nombre = body.nombre;
    actor.edad = body.edad;
    actor.estaRetirado = body.estaRetirado;
    actor.premios = body.premios;
    delete actor._id;

    await actorCollection.insertOne(actor)
        .then((data) => {
            if (!data.acknowledged) {
                return res.status(400).json({ message: "No se pudo crear el actor" });
            }
            return res.status(201).json({ message: "Actor creado exitosamente", id: data.insertedId });
        })
        .catch((e) => {
            return res.status(500).json({ message: "Error al crear el actor", error: e.message });
        });
}

async function handleGetActoresRequest(req, res) {
    await actorCollection.find().toArray()
        .then((data) => {
            return res.status(200).json(data);
        })
        .catch((e) => {
            return res.status(500).json({ message: "Error al obtener los actores", error: e.message });
        });
}

async function handleGetActorByIdRequest(req, res) {
    const id = req.params.id;
    let oid;
    try {
        oid = ObjectId.createFromHexString(id);
    } catch (e) {
        return res.status(400).json({ message: "Id mal formado" });
    }

    await actorCollection.findOne({ _id: oid })
        .then((data) => {
            if (!data) {
                return res.status(404).json({ message: "Actor no encontrado" });
            }
            return res.status(200).json(data);
        })
        .catch((e) => {
            return res.status(500).json({ message: "Error al buscar el actor", error: e.message });
        });
}

async function handleGetActoresByPeliculaIdRequest(req, res) {
    const idPelicula = req.params.pelicula;

    await actorCollection.find({ idPelicula: idPelicula }).toArray()
        .then((data) => {
            return res.status(200).json(data);
        })
        .catch((e) => {
            return res.status(500).json({ message: "Error al obtener los actores de la película", error: e.message });
        });
}
async function handleGetActorOrByPeliculaRequest(req, res) {
    const param = req.params.id;

    let oid;
    try {
        oid = ObjectId.createFromHexString(param);
    } catch (e) {
        req.params.pelicula = param;
        return handleGetActoresByPeliculaIdRequest(req, res);
    }

    await actorCollection.findOne({ _id: oid })
        .then((actor) => {
            if (actor) {
                return res.status(200).json(actor);
            }
            req.params.pelicula = param;
            return handleGetActoresByPeliculaIdRequest(req, res);
        })
        .catch((e) => {
            return res.status(500).json({ message: "Error al buscar el actor", error: e.message });
        });
}

export default {
    handleInsertActorRequest,
    handleGetActoresRequest,
    handleGetActorByIdRequest,
    handleGetActoresByPeliculaIdRequest,
    handleGetActorOrByPeliculaRequest
};
