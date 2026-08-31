import type { CollectionBeforeDeleteHook, CollectionConfig } from 'payload'

const cascadeDeleteCategoria: CollectionBeforeDeleteHook = async ({ req: { payload }, id }) => {
  if (!id) return
  try {
    // Buscar itens que pertencem a esta categoria e deletá-los em cascata
    const relatedItens = await payload.find({
      collection: 'itens',
      where: {
        categoria: {
          equals: id,
        },
      },
      limit: 500,
    })

    for (const item of relatedItens.docs) {
      await payload.delete({
        collection: 'itens',
        id: item.id,
      })
    }
  } catch (error) {
    console.error('Erro ao deletar dependências da categoria:', error)
  }
}

export const Categorias: CollectionConfig = {
  slug: 'categorias',
  admin: {
    useAsTitle: 'nome',
    group: '📦 Almoxarifado & Catálogo',
    description: 'Categorias de materiais, insumos, ferramentas e EPIs',
    defaultColumns: ['nome', 'tipo', 'slug'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeDelete: [cascadeDeleteCategoria],
  },
  fields: [
    {
      name: 'nome',
      type: 'text',
      label: 'Nome da Categoria',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug / Identificador',
      required: true,
      unique: true,
      admin: {
        description: 'Ex: alvenaria, ferramentas-eletricas, epis, hidraulica',
      },
    },
    {
      name: 'tipo',
      type: 'select',
      label: 'Tipo Principal',
      defaultValue: 'material',
      required: true,
      options: [
        { label: '🧱 Material / Insumo', value: 'material' },
        { label: '🔨 Ferramenta / Equipamento', value: 'ferramenta' },
        { label: '🦺 EPI / Segurança', value: 'epi' },
        { label: '📦 Geral / Outros', value: 'geral' },
      ],
    },
    {
      name: 'cor',
      type: 'select',
      label: 'Cor do Selo (Badge)',
      defaultValue: 'blue',
      options: [
        { label: 'Azul', value: 'blue' },
        { label: 'Laranja / Âmbar', value: 'amber' },
        { label: 'Verde', value: 'emerald' },
        { label: 'Roxo', value: 'purple' },
        { label: 'Vermelho / Rosa', value: 'rose' },
        { label: 'Cinza', value: 'slate' },
      ],
    },
    {
      name: 'descricao',
      type: 'textarea',
      label: 'Descrição',
    },
  ],
}
