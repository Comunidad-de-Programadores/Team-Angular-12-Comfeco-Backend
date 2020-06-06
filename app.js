const express = require('express')
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

console.log(process.env.NODE_ENV);

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

//Inicializar Variables
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//Importar rutas

// const usuarioRouter = require('./router/usuario_router');
const appRouter = require('./router/app_router');
const productoRouter = require('./router/producto_router');
const loginRouter = require('./router/login_router');
const pedidoRouter = require('./router/pedido_router');
const distritoRouter = require('./router/distrito_router');
const categoriaRouter = require('./router/categoria_router');

//conexion Base de datos

(async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log('Base de datos online');
    } catch (err) {
        console.log('error: ' + err)
    }
})();

//Rutas

// app.use('/usuario', usuarioRouter);
app.use('/login', loginRouter);
app.use('/producto', productoRouter);
app.use('/categoria', categoriaRouter);
app.use('/pedido', pedidoRouter);
app.use('/distrito', distritoRouter);
app.use('/', appRouter);

// Iniciar servidor
app.listen(process.env.PORT, () => {
    console.log(process.env.PORT);
    console.log('Express Serve puerto 3000 online');
})