import { Request, Response } from "express";
import { comparePasswords, hashPassword } from "../services/password";
import prisma from  '../models/user'
import { generateToken } from "../services/authservices";

export const register = async(req: Request, res: Response): Promise<void> => {
    
    const { email, password } = req.body



try {

    // VALIDACION DE EMAIL Y CONTRASEÑA
    
    // SI EL EMAIL NO EXISTE

    if (!email) {
        res.status(400).json({ message: 'Email is required' })
        return
        
    }

    if (!password) {
        res.status(400).json({ message: 'Password is required' })
        return
    }
    
    const hashedPassword = await hashPassword(password)
    

    //  USER ES UNA INSTANCIA DE PRISMA PARA PODER CONECTAR A LA BASE DE DATOS SQL
    const user = await prisma.create(
        {
            data: {
                email,
                password: hashedPassword
            }
        }
    )

    //EN ESTW TOKEN LE PASAMOS EL USUARIO QUE CREAMOS
    // STATUS 201 SIGNIFICA QUE FUE CREADO CORRECTAMENTE
    // .JSON ES PARA DEVOLVER EL TOKEN
    // PARA QUE EL FRONTEND PUEDA MANTENERSE LOGUEADO 
    // PORQUE CUANDO HAGAMOS UNA APIREST VAMOS A NECESITAR ESE TOKEN QUE VA EXPIRAR EN UNA HORA

    const token = generateToken(user)
    res.status(201).json({token})

} catch (error:any) {
    //CAPTURAMOS EL ERROR POR SI NO PASA POR ARRIBA Y NO DÉ UN ERROR EN PRISMA
    // ESTO LO VAMOS A MANEJAR CON ERRORES PROPIOS DE PRISMA 
    

    if(error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
        res.status(400).json({ message: 'Email if existis in database' })
    }

    console.log(error)
    res.status(500).json( { error: 'Hubo un error en el registro' } )


}

}

//ESTO VA POR FUERA DE LA OTRA FUNCION PORQUE ES OTRA FUNCION ES EL LOGIN
export const login = async (req: Request, res: Response): Promise<void> =>{
    const { email, password } = req.body
    try {
        // SI NO MANDAN EL EMAIL 
        
        if (!email) {
            res.status(400).json({ message: 'Email is required' })
            return
            
        }
    
        if (!password) {
            res.status(400).json({ message: 'Password is required' })
            return
        }

        //EL EMAIL ES UNICO POR ESO FINDUNIQUE
        // EN ESTE CODIGO PRISMA BUSCA EL USUARIO DONDE EL EMAIL SEA EL EMAIL 
        // QUE ESTAMOS BUSCANDO DE REQ.BODY
        
        const user = await prisma.findUnique({ where : {email} })
        // UNA VEZ IDENTIFICADO HAY QUE COMPARAR LAS PASSWORD
        // SI NO HAY USUARIO IF(!USER)
        if (!user){
            res.status(404).json({ error: 'Usuario no encontrado'})
            return
        }
        //SI HAY USUARIO COMPARAMOS LAS PASSWORDS (COMPARAMOS HASH CON HASH)
        // EL COMPAREPASSWORD BIENE DE PASSWORD.TS AQUI SE IMPORTA Y ALLA LO EXPORTAMOS
        const passwordMatch =  await comparePasswords(password, user.password) 
        //SI PASSWORDMATCH NO COINCIDEN !
        if (!passwordMatch) {
            res.status(401).json({ error: 'User and Password incorrects' })
        }
        //SI COINCIDEN GENERAMOS EL TOKEN
        const token = generateToken(user)
        res.status(200).json({ token })


    } catch (error:any) {
        console.log('Error: ',error)

        

    }
}
