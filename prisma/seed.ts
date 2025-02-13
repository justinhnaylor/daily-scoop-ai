import { PrismaClient } from "@prisma/client"
import * as dotenv from "dotenv"
import { fileURLToPath } from "url"
import { dirname } from "path"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, "../.env") })

const databaseUrl = "postgresql://user:user@localhost:5432/daily-scoop-ai"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
})

const categories = [
  "Breaking News",
  "Politics",
  "World News",
  "Business & Finance",
  "Technology",
  "Entertainment",
  "Sports",
  "Health & Wellness",
  "Science",
  "Art & Culture",
  "Travel",
  "Food & Drink",
  "Environment",
  "Lifestyle",
  "Opinion",
  "Education",
  "Religion",
  "Other",
]

async function main() {
  for (const categoryName of categories) {
    await prisma.category.create({
      data: {
        name: categoryName,
      },
    })
    console.log(`Category "${categoryName}" created`)
  }

  const dailyBotUser = await prisma.user.create({
    data: {
      id: "a66dd82e-9e8e-44e8-94fa-825dd1cd2f7c",
      username: "daily-bot",
      name: "Daily Bot",
      email: "",
      profilePictureUrl:
        "https://dymrplcuovidgyepquba.supabase.co/storage/v1/object/public/images//daily-bot-compressed.webp",
    },
  })

  console.log('User "Daily Bot" created:', dailyBotUser)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
