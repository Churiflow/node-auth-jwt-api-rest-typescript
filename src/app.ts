import dotenv from 'dotenv';
//DOTENV PARA LLAMAR LAS VARIABLES DE ENTORNO
dotenv.config()
import express from 'express';
import authRoutes from './routes/authRoutes'
import usersRoutes from './routes/userRoutes';

// CON ESTA LÍNEA SE INICIALIZA LA APLICACIÓN DE EXPRESS Y SE PUEDE EMPEZAR A AGREGAR MIDDLEWARES Y CONFIGURAR RUTAS.
const app = express()


// APP.USE(EXPRESS.JSON()): ACTIVA EL MIDDLEWARE DE EXPRESS PARA MANEJAR DATOS EN FORMATO JSON EN LAS SOLICITUDES POST Y PUT.
app.use(express.json())



//ROUTES
app.use('/auth', authRoutes)
app.use('/users', usersRoutes)

//AUTENTICACION
//USER

// HACER UNA AUTENTICACION DE USUARIOS

console.log("Esto esta ejecutandose y esto biene de app.ts")

export default app