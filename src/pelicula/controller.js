import { ObjectId } from "mongodb";
import client from "../common/db.js";
import { Pelicula } from "./pelicula.js";


const peliculaCollection = client.db("cine-db").collection("peliculas");

async function handleInsertPeliculaRequest(req, res) {
    const body = req.body;

    const pelicula = { ...Pelicula };
    pelicula.nombre = body.nombre;
    pelicula.generos = body.generos;
    pelicula.anioEstreno = body.anioEstreno;
    delete pelicula._id; // MongoDB genera el _id automáticamente

    await peliculaCollection.insertOne(pelicula)
        .then((data) => {
            if (!data.acknowledged) {
                return res.status(400).json({ message: "No se pudo crear la película" });
            }
            return res.status(201).json({ message: "Película creada exitosamente", id: data.insertedId });
        })
        .catch((e) => {
            return res.status(500).json({ message: "Error al crear la película", error: e.message });
        });
}

async function handleGetPeliculasRequest(req, res) {
    await peliculaCollection.find().toArray()
        .then((data) => {
            return res.status(200).json(data);
        })
        .catch((e) => {
            return res.status(500).json({ message: "Error al obtener las películas", error: e.message });
        });
}

async function handleGetPeliculaByIdRequest(req, res) {
    const id = req.params.id;
    let oid;
    try {
        oid = ObjectId.createFromHexString(id);
    } catch (e) {
        return res.status(400).json({ message: "Id mal formado" });
    }

    await peliculaCollection.findOne({ _id: oid })
        .then((data) => {
            if (!data) {
                return res.status(404).json({ message: "Película no encontrada" });
            }
            return res.status(200).json(data);
        })
        .catch((e) => {
            return res.status(500).json({ message: "Error al buscar la película", error: e.message });
        });
}

async function handleUpdatePeliculaByIdRequest(req, res) {
    const id = req.params.id;
    let oid;
    try {
        oid = ObjectId.createFromHexString(id);
    } catch (e) {
        return res.status(400).json({ message: "Id mal formado" });
    }

    const body = req.body;
    const query = {
        $set: {
            nombre: body.nombre,
            generos: body.generos,
            anioEstreno: body.anioEstreno
        }
    };

    await peliculaCollection.updateOne({ _id: oid }, query)
        .then((data) => {
            if (data.matchedCount === 0) {
                return res.status(404).json({ message: "Película no encontrada" });
            }
            return res.status(200).json({ message: "Película actualizada exitosamente" });
        })
        .catch((e) => {
            return res.status(500).json({ message: "Error al actualizar la película", error: e.message });
        });
}

async function handleDeletePeliculaByIdRequest(req, res) {
    const id = req.params.id;
    let oid;
    try {
        oid = ObjectId.createFromHexString(id);
    } catch (e) {
        return res.status(400).json({ message: "Id mal formado" });
    }

    await peliculaCollection.deleteOne({ _id: oid })
        .then((data) => {
            if (data.deletedCount === 0) {
                return res.status(404).json({ message: "Película no encontrada" });
            }
            return res.status(200).json({ message: "Película eliminada exitosamente" });
        })
        .catch((e) => {
            return res.status(500).json({ message: "Error al eliminar la película", error: e.message });
        });
}

export { peliculaCollection };

export default {
    handleInsertPeliculaRequest,
    handleGetPeliculasRequest,
    handleGetPeliculaByIdRequest,
    handleUpdatePeliculaByIdRequest,
    handleDeletePeliculaByIdRequest
};
