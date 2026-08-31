import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Obras } from './collections/Obras'
import { Categorias } from './collections/Categorias'
import { Itens } from './collections/Itens'
import { EstoqueObra } from './collections/EstoqueObra'
import { Movimentacoes } from './collections/Movimentacoes'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' - Controle de Estoque & Almoxarifado de Obras',
    },
  },
  collections: [Obras, Categorias, Itens, EstoqueObra, Movimentacoes, Media, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'super-secret-stock-key-1234567890',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    push: true,
    client: {
      url: process.env.DATABASE_URL || 'file:./database.db',
      authToken: process.env.DATABASE_TOKEN || '',
    },
  }),
  sharp,
  plugins: [],
})
