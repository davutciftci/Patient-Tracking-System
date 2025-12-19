import { PrismaClient } from '../../generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'
import 'dotenv/config'

// DATABASE_URL'den file: path'i al veya varsayılan kullan
const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
// file: prefix'i ile başlıyorsa, göreli yolu mutlak yola çevir
const dbPath = dbUrl.startsWith('file:')
    ? `file:${path.resolve(process.cwd(), dbUrl.replace('file:', '').replace('./', ''))}`
    : dbUrl

const adapter = new PrismaLibSql({ url: dbPath })
const prisma = new PrismaClient({ adapter })

export default prisma
