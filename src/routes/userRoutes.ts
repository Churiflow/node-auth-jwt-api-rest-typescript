import express, { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken'
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/usersControllers"

// EN ROUTER.POST ES EL CONTROLADOR O CONTROLLER

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'

const auntenticateToken = (req:Request, res:Response, next: NextFunction) => {
    
    // PARA LA AUTENTICACION MANDAMOS A TRAVES DE LOS HEADERS LOS TOKENS
    
    const authHeader = req.headers['authorization']
    
    // SI AUTHHEADER EXISTE HACEMOS UN SPLIT
    // EL AUTHHEADER PROPORCIONA INFORMACION DE SOLICITUD O RESPUESTA COMO CONTENIDO
    // (CONTENT-TYPE, Y O AUTENTICACION (AUTORIZACION))
    // EL SPLIT SE UTILIZA PARA DIVIDIR UNA CADENA DE TEXTO(STRING) EN UN ARREGLO DE SUBCADENAS(ARRAY) LO SEPARA CON UNA COMA O ESPACIO, ETC.
    
    const token = authHeader && authHeader.split(' ')[1]

    // SI NO HAY TOKE O ES DIFERENTE ME DARÁ UN ERROR
    if (!token){
        return res.status(401).json({message: 'Token no encontrado, o no autorizado'})
    }

    jwt.verify(token, JWT_SECRET, (err, decoded)=>{
        if (err){
            console.error('Error en la autenticacion: ', err)
            return res.status(403).json({error: 'Token no valido o no tienes acceso a este recurso'})
        }
        next();
    
    })
}


//MIDLEWARE DE JWT PARA VER SI ESTAMOS AUTENTICADOS
//AUTENTICATETOKEN ES EL MIDLEWARE Y EL SEGUNDO PARAMETRO

// router.post('/', auntenticateToken, () => {return console.log('post')})
// router.get('/', auntenticateToken, () => {return console.log('getAll')})
// router.get('/:id', auntenticateToken, () => {return console.log('getById')})
// router.put('/:id', auntenticateToken, () => {return console.log('put')})
// router.delete('/:id', auntenticateToken, () => {return console.log('delete')})

router.post('/', auntenticateToken,  createUser)
router.get('/', auntenticateToken,  getAllUsers)
router.get('/:id', auntenticateToken, getUserById)
router.put('/:id', auntenticateToken,  updateUser)
router.delete('/:id', auntenticateToken,  deleteUser)

export default router;