import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    group: '📁 Arquivos & Mídia',
    description: 'Imagens de materiais, canteiros de obra e comprovantes de entrega',
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'public/media',
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto Alternativo (Alt)',
      required: false,
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Legenda / Descrição',
    },
  ],
}
