import type { CollectionBeforeDeleteHook, CollectionConfig } from 'payload'

const cascadeDeleteItem: CollectionBeforeDeleteHook = async ({ req: { payload }, id }) => {
  if (!id) return
  try {
    // 1. Deletar estoque deste item em todas as obras
    await payload.delete({
      collection: 'estoque-obra',
      where: {
        item: {
          equals: id,
        },
      },
    })

    // 2. Deletar movimentações deste item
    await payload.delete({
      collection: 'movimentacoes',
      where: {
        item: {
          equals: id,
        },
      },
    })
  } catch (error) {
    console.error('Erro ao deletar dependências em cascata do item:', error)
  }
}

export const Itens: CollectionConfig = {
  slug: 'itens',
  admin: {
    useAsTitle: 'nome',
    group: '📦 Almoxarifado & Catálogo',
    description: 'Catálogo de materiais, insumos, ferramentas e EPIs',
    defaultColumns: ['nome', 'codigo', 'tipo', 'categoria', 'unidade', 'estoqueMinimoPadrao'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeDelete: [cascadeDeleteItem],
  },
  fields: [
    {
      name: 'nome',
      type: 'text',
      label: 'Nome do Item',
      required: true,
      admin: {
        description: 'Ex: Cimento CP-II 50kg, Furadeira de Impacto Bosch GSB 13 RE',
      },
    },
    {
      name: 'codigo',
      type: 'text',
      label: 'Código / SKU / Código de Barras',
      required: true,
      unique: true,
      admin: {
        description: 'Código único para identificação rápida no almoxarifado',
      },
    },
    {
      name: 'tipo',
      type: 'select',
      label: 'Tipo de Item',
      defaultValue: 'material_consumivel',
      required: true,
      options: [
        { label: '🧱 Insumo / Material Consumível', value: 'material_consumivel' },
        { label: '🔨 Ferramenta / Equipamento Durável', value: 'ferramenta_equipamento' },
        { label: '🦺 EPI / Equipamento de Proteção', value: 'epi_seguranca' },
      ],
    },
    {
      name: 'categoria',
      type: 'relationship',
      relationTo: 'categorias',
      label: 'Categoria',
      required: true,
    },
    {
      name: 'unidade',
      type: 'select',
      label: 'Unidade de Medida',
      defaultValue: 'un',
      required: true,
      options: [
        { label: 'Unidade (un)', value: 'un' },
        { label: 'Saco (saco)', value: 'saco' },
        { label: 'Barra (barra)', value: 'barra' },
        { label: 'Rolo (rolo)', value: 'rolo' },
        { label: 'Caixa (cx)', value: 'cx' },
        { label: 'Pacote (pct)', value: 'pct' },
        { label: 'Quilograma (kg)', value: 'kg' },
        { label: 'Tonelada (ton)', value: 'ton' },
        { label: 'Metro (m)', value: 'm' },
        { label: 'Metro Quadrado (m²)', value: 'm2' },
        { label: 'Metro Cúbico (m³)', value: 'm3' },
        { label: 'Litro (L)', value: 'litro' },
        { label: 'Galão / Balde', value: 'galao' },
        { label: 'Par (par)', value: 'par' },
      ],
    },
    {
      name: 'estoqueMinimoPadrao',
      type: 'number',
      label: 'Estoque Mínimo Padrão (Alerta)',
      defaultValue: 5,
      min: 0,
      admin: {
        description: 'Quantidade mínima recomendada para gerar alerta de reposição',
      },
    },
    {
      name: 'foto',
      type: 'relationship',
      relationTo: 'media',
      label: 'Foto do Item',
    },
    {
      name: 'fotoUrl',
      type: 'text',
      label: 'URL da Imagem (Opcional / Fallback)',
      admin: {
        description: 'URL externa de imagem caso não faça upload de arquivo',
      },
    },
    {
      name: 'marca',
      type: 'text',
      label: 'Marca / Fabricante',
    },
    {
      name: 'numeroPatrimonio',
      type: 'text',
      label: 'Nº de Patrimônio / Série (Ferramentas)',
      admin: {
        condition: (data) => data?.tipo === 'ferramenta_equipamento',
        description: 'Identificador único da ferramenta física',
      },
    },
    {
      name: 'estadoConservacao',
      type: 'select',
      label: 'Estado de Conservação (Ferramentas)',
      defaultValue: 'bom',
      options: [
        { label: '✨ Novo / Sem uso', value: 'novo' },
        { label: '👍 Ótimo estado', value: 'otimo' },
        { label: '👌 Bom estado de uso', value: 'bom' },
        { label: '🔧 Em manutenção / Revisão', value: 'em_manutencao' },
        { label: '⚠️ Danificado / Descartado', value: 'danificado' },
      ],
      admin: {
        condition: (data) => data?.tipo === 'ferramenta_equipamento',
      },
    },
    {
      name: 'custoUnitario',
      type: 'number',
      label: 'Custo Unitário Estimado (R$)',
      min: 0,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'especificacoes',
      type: 'textarea',
      label: 'Especificações Técnicas e Instruções',
    },
  ],
}
