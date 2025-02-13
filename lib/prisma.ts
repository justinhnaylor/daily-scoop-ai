import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.NODE_ENV !== "production"
          ? process.env.DATABASE_URL_PROD
          : process.env.DATABASE_URL,
    },
  },
})

console.log("env", prisma)

export default prisma
