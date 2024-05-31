// MODELO DE PRISMA PARA EL USUARIO

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma.user;