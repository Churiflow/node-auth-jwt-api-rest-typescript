import express from 'express'
import {login, register } from '../controllers/authController';

const router = express.Router()

//REGISTER Y LOGIN AMBOS DEVUELVEN UN TOKEN
//AQUI EL REGISTER ENVIA EL NUEVO USUARIO REGISTRADO A LA BASE DE DATOS
router.post('/register', register)
//EL LOGIN CONFIRMA SI EXISTE O NO 
router.post('/login', login)

export default router;