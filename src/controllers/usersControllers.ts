import { Request, Response } from "express"
import { hashPassword } from "../services/password"
import prisma from '../models/user'


// CREATE USER

export const createUser = async (req:Request, res:Response): Promise<void> =>{
    try {

        const { email , password } = req.body

        if (!email) {
            res.status(400).json({ message: 'Email is required' })
            return
            
        }
    
        if (!password) {
            res.status(400).json({ message: 'Password is required' })
            return
        }


        const hasshedPassword = await hashPassword(password)
        const user = await prisma.create(
            {
                data: {
                    email,
                    password: hasshedPassword
            }
        }
        )
        // SI SALE TODO BIEN DEVOLVEMOS UN ESTADO 201 DE USER
        res.status(201).json(user)
        
    } catch (error:any) {

        {
            //CAPTURAMOS EL ERROR POR SI NO PASA POR ARRIBA Y NO DÉ UN ERROR EN PRISMA
            // ESTO LO VAMOS A MANEJAR CON ERRORES PROPIOS DE PRISMA 
            
        
            if(error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
                res.status(400).json({ message: 'Email if existis in database' })
            }
        
            console.log(error)
            res.status(500).json( { error: 'Hubo un error en el registro, pruebe mas tarde' } )
        
        
        }

        
    }
}

// GET ALL : OBTENCION DE TODOS LOS DATOS

// GET ALL USERS
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        // EL FINDMANY OBTIENE TODOS LOS USUARIOS DE LA BASE DE DATOS
        // RECUPERA TODOS LOS REGISTROS DE LA TABLA DE USUARIOS SIN APLICAR FILTROS.
        // DEVUELVE UN ARRAY CON LOS REGISTROS ENCONTRADOS.
        const users = await prisma.findMany(); 

        // ENVÍA UNA RESPUESTA CON ESTADO 200 Y LA LISTA DE USUARIOS EN FORMATO JSON
        res.status(200).json(users); 
    } catch (error: any) {
        // MUESTRA EL ERROR EN LA CONSOLA
        console.log(error); 

        // ENVÍA UNA RESPUESTA CON ESTADO 500 Y UN MENSAJE DE ERROR
        res.status(500).json({ error: 'Hubo un error al obtener los usuarios, pruebe mas tarde' }); 
    }
}

// GET INDIVIDUAL

// GET USER BY ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    

        // OBTIENE EL ID DE LOS PARÁMETROS DE LA SOLICITUD
        // req: LA SOLICITUD HTTP RECIBIDA
        // req.params: CONTIENE LOS PARÁMETROS DE RUTA DE LA SOLICITUD

        const userId  = parseInt( req.params.id )

    try {
        // BUSCA EL USUARIO EN LA BASE DE DATOS POR ID
        // prisma: EL CLIENTE DE PRISMA PARA INTERACTUAR CON LA BASE DE DATOS
        // findUnique: MÉTODO DE PRISMA PARA ENCONTRAR UN REGISTRO ÚNICO
        // where: CONDICIÓN PARA BUSCAR EL REGISTRO
        
        const user = await prisma.findUnique({
            where: { id: userId } // id: EL ID DEL USUARIO CONVERTIDO A NÚMERO
        });

        // SI NO SE ENCUENTRA EL USUARIO, DEVUELVE UN ESTADO 404
        // user: EL USUARIO ENCONTRADO O NULL
        // res: LA RESPUESTA HTTP A ENVIAR
        // status(404): ESTADO HTTP 404 (NO ENCONTRADO)
        // json: ENVÍA LA RESPUESTA COMO JSON

        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return; // TERMINA LA EJECUCIÓN SI EL USUARIO NO SE ENCUENTRA
        }

        // SI SE ENCUENTRA EL USUARIO, DEVUELVE UN ESTADO 200 Y EL USUARIO EN FORMATO JSON
        // status(200): ESTADO HTTP 200 (OK)
        
        res.status(200).json(user);
    } catch (error: any) {
        
        // MUESTRA EL ERROR EN LA CONSOLA
        
        console.log(error);

        // ENVÍA UNA RESPUESTA CON ESTADO 500 Y UN MENSAJE DE ERROR
        // status(500): ESTADO HTTP 500 (ERROR INTERNO DEL SERVIDOR)
        
        res.status(500).json({ error: 'Hubo un error al obtener el usuario, pruebe mas tarde' });
    }
};


// ACTUALIZAR USUARIO (BASICAMENTE UN PUT)
// UPDATE USER BY ID
export const updateUser = async (req: Request, res: Response): Promise<void> => {

    // OBTIENE EL ID DEL USUARIO DE LOS PARÁMETROS DE LA SOLICITUD
    // USERID ALMACENA EL ID DEL USUARIO OBTENIDO DE LOS PARÁMETROS DE LA SOLICITUD

    const userId = parseInt(req.params.id); 

    // OBTIENE EL EMAIL Y LA CONTRASEÑA DEL CUERPO DE LA SOLICITUD
     // EMAIL Y PASSWORD ALMACENAN EL CORREO ELECTRÓNICO Y LA CONTRASEÑA OBTENIDOS DEL CUERPO DE LA SOLICITUD

    const { email, password } = req.body;

    try {

        // CREA UN OBJETO CON LOS DATOS A ACTUALIZAR
        // DATATOUPDATE ES UN OBJETO QUE CONTIENE LOS DATOS A ACTUALIZAR, INICIALMENTE COPIANDO TODO EL CUERPO DE LA SOLICITUD

        let dataToUpdate: any = { ...req.body }; 

        // SI SE PROPORCIONA UNA CONTRASEÑA, LA HASHEA ANTES DE ACTUALIZARLA

        if (password) {

            // HASHEA LA CONTRASEÑA Y LA ASIGNA A LOS DATOS A ACTUALIZAR

            const hashedPassword = await hashPassword(password);

            // SE ASIGNA LA CONTRASEÑA HASHEADA A LOS DATOS A ACTUALIZAR SI SE PROPORCIONÓ UNA CONTRASEÑA

            dataToUpdate.password = hashedPassword; 
        }

        // SI SE PROPORCIONA UN EMAIL, LO ACTUALIZA

        if (email) {

            // ACTUALIZA EL EMAIL EN LOS DATOS A ACTUALIZAR
            // SE ASIGNA EL CORREO ELECTRÓNICO A LOS DATOS A ACTUALIZAR SI SE PROPORCIONÓ UN CORREO ELECTRÓNICO

            dataToUpdate.email = email; 
        }

        // ACTUALIZA EL USUARIO EN LA BASE DE DATOS POR SU ID

        const user = await prisma.update({

            // ESPECIFICA EL USUARIO A ACTUALIZAR POR SU ID

            where: { id: userId },

            // PASA LOS DATOS ACTUALIZADOS DEL USUARIO

            data: dataToUpdate
        });

        // DEVUELVE EL USUARIO ACTUALIZADO
        // RES ES LA RESPUESTA HTTP A ENVIAR, STATUS ESTABLECE EL CÓDIGO DE ESTADO HTTP Y JSON ENVÍA EL USUARIO ACTUALIZADO COMO JSON

        res.status(200).json(user); 

    } catch (error: any) {

        // MANEJA LOS ERRORES

        // VERIFICA SI EL ERROR TIENE UN CÓDIGO ESPECÍFICO Y SI SE REFIERE A UN CONFLICTO DE CORREO ELECTRÓNICO

        if (error?.code === 'P2002' && error?.meta?.target?.includes('email')) {

            // SI EL CORREO YA EXISTE, ENVÍA UN MENSAJE DE ERROR
            // RES ES LA RESPUESTA HTTP A ENVIAR Y JSON ENVÍA UN MENSAJE DE ERROR COMO JSON
            
            res.status(400).json({ message: 'El correo ya existe en la base de datos' }); 
        } 
        // VERIFICA SI EL CÓDIGO DE ERROR ES PARA USUARIO NO ENCONTRADO
        else if (error?.code == 'P2025') {

            // SI NO SE ENCUENTRA EL USUARIO, ENVÍA UN MENSAJE DE ERROR
            // RES ES LA RESPUESTA HTTP A ENVIAR Y JSON ENVÍA UN MENSAJE DE ERROR COMO JSON

            res.status(404).json('Usuario no encontrado'); 
        } else {

            // SI OCURRE OTRO TIPO DE ERROR, MUESTRA EL ERROR EN LA CONSOLA
            // CONSOLE MUESTRA EL ERROR EN LA CONSOLA

            console.error(error); 

            // ENVÍA UN MENSAJE DE ERROR GENÉRICO
            // RES ES LA RESPUESTA HTTP A ENVIAR Y JSON ENVÍA UN MENSAJE DE ERROR COMO JSON

            res.status(500).json({ error: 'Hubo un error al actualizar el usuario, intente más tarde' }); 
        }
    }
};


// ELIMINAR

// DELETE USER BY ID
export const deleteUser = async (req: Request, res: Response): Promise<void> => {

    // OBTIENE EL ID DEL USUARIO DE LOS PARÁMETROS DE LA SOLICITUD
     // USERID ALMACENA EL ID DEL USUARIO OBTENIDO DE LOS PARÁMETROS DE LA SOLICITUD

    const userId = parseInt(req.params.id);

    try {

        // ELIMINA EL USUARIO EN LA BASE DE DATOS POR SU ID

        await prisma.delete({

            // ESPECIFICA EL USUARIO A ELIMINAR POR SU ID

            where: { id: userId }
        });

        // DEVUELVE UN MENSAJE DE ÉXITO
        // RES ES LA RESPUESTA HTTP A ENVIAR Y JSON ENVÍA UN MENSAJE DE ÉXITO COMO JSON

        res.status(200).json({
             message: `Usuario ${userId} eliminado correctamente` 
            }).end() 

    } catch (error: any) {

        // MANEJA LOS ERRORES

        // VERIFICA SI EL CÓDIGO DE ERROR ES PARA USUARIO NO ENCONTRADO

        if (error?.code == 'P2025') {

            // SI NO SE ENCUENTRA EL USUARIO, ENVÍA UN MENSAJE DE ERROR
            // RES ES LA RESPUESTA HTTP A ENVIAR Y JSON ENVÍA UN MENSAJE DE ERROR COMO JSON

            res.status(404).json('Usuario no encontrado'); 
        } else {

            // SI OCURRE OTRO TIPO DE ERROR, MUESTRA EL ERROR EN LA CONSOLA
            // CONSOLE MUESTRA EL ERROR EN LA CONSOLA

            console.error(error); 

            // ENVÍA UN MENSAJE DE ERROR GENÉRICO
            // RES ES LA RESPUESTA HTTP A ENVIAR Y JSON ENVÍA UN MENSAJE DE ERROR COMO JSON

            res.status(500).json({ error: 'Hubo un error al eliminar el usuario, intente más tarde' }); 
        }
    }
};


