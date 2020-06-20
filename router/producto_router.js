const express = require('express');
const app = express();
const cloudinary = require('cloudinary').v2;
const fileUpload = require('express-fileupload');

//Middelware
mdAutenticacion = require('../middlewares/autenticacion');
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

//Modelos

const productoModel = require('../model/producto_model');
const categoriaModel = require('../model/categoria_model');



//Crear productos

app.post('/', async(req, res) => {
    const id_categoria = req.body.id_categoria;
    const body = req.body;
    if (!req.files || !req.files.img) {
        return res.status(400).json({
            ok: false,
            mensaje: 'La imagen es requerida',
        });
    }
    try {
        const categoriaEncontrada = await categoriaModel.findById(id_categoria);
        if (!categoriaEncontrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe esa categoria',
            });
        }
        const result = await cloudinary.uploader.upload(req.files.img.tempFilePath);
        const newProduct = new productoModel({
            name: body.name,
            img: result.secure_url,
            public_id: result.public_id,
            description: body.description,
            price: body.price,
            id_categoria: id_categoria
        });
        newProduct.save(async(error, productoGuardado) => {
            if (error) {
                await cloudinary.uploader.destroy(result.public_id);
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error en la base de datos',
                    error
                });
            }
            categoriaEncontrada.producto_number = categoriaEncontrada.producto_number + 1;
            await categoriaEncontrada.save();
            return res.status(200).json({
                ok: true,
                mensaje: 'Producto guardado correctamente',
                productoGuardado
            });
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error
        });
    }
});

//Obtener todo los productos

app.get('/', async(req, res) => {
    const query = req.query;
    const regexName = new RegExp(query.search, "i")
    const filters = {
        id_categoria: query.id_categoria,
        name: regexName
    }
    Object.keys(filters).forEach(key => (filters[key] === undefined || filters[key] === '') && delete filters[key])
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 5;
    const desde = (page - 1) * limit;
    try {
        const productosEncontrados = await productoModel.find(filters).skip(desde).limit(limit).exec();
        productoModel.estimatedDocumentCount({}, (error, conteo) => {
            res.status(200).json({
                ok: true,
                productos: productosEncontrados,
                count: Math.ceil(conteo / limit),
                page,
                limit
            });
        })
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error
        });
    }
});

//Actulizar Producto

app.put('/:id', async(req, res) => {
    const id_producto = req.params.id;
    const body = req.body;
    try {
        const productoEncontrado = await productoModel.findById(id_producto);
        if (!productoEncontrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El producto no existe',
            });
        }
        if (body.name) {
            productoEncontrado.name = body.name;
        }
        if (body.price) {
            productoEncontrado.price = body.price;
        }
        if (body.description) {
            productoEncontrado.description = body.description;
        }
        if (body.stock) {
            productoEncontrado.stock = body.stock;
        }
        if (body.state) {
            productoEncontrado.state = body.state;
        }
        if (req.files && req.files.img) {
            await cloudinary.uploader.destroy(productoEncontrado.public_id);
            const result = await cloudinary.uploader.upload(req.files.img.tempFilePath);
            productoEncontrado.img = result.secure_url;
            productoEncontrado.public_id = result.public_id;
        }
        const productoGuardado = await productoEncontrado.save();
        return res.status(200).json({
            ok: true,
            mensaje: 'Producto actualizado correctamente',
            productoGuardado
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error
        });
    }
});

app.delete('/:id', async(req, res) => {
    const idProducto = req.params.id;
    try {
        const productoRemovida = await productoModel.findByIdAndRemove(idProducto);
        if (!productoRemovida) {
            return res.status(400).json({
                ok: true,
                mensaje: 'El producto no existe',
            });
        }
        await cloudinary.uploader.destroy(productoRemovida.public_id);
        return res.status(200).json({
            ok: true,
            mensaje: 'Producto eliminado correctamente',
            productoRemovida
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la base de datos',
            error
        });
    }
});

module.exports = app;