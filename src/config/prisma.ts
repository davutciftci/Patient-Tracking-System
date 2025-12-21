import { PrismaClient } from '../../generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'
import 'dotenv/config'

const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
const dbPath = dbUrl.startsWith('file:')
    ? `file:${path.resolve(process.cwd(), dbUrl.replace('file:', '').replace('./', ''))}`
    : dbUrl

const adapter = new PrismaLibSql({ url: dbPath })
const prisma = new PrismaClient({ adapter })

export default prisma
