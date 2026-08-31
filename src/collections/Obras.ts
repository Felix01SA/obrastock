import type { CollectionBeforeDeleteHook, CollectionConfig } from 'payload'

const cascadeDeleteObra: CollectionBeforeDeleteHook = async ({ req: { payload }, id }) => {
  if (!id) return
  try {
    // 1. Deletar todos os registros de estoque vinculados a esta obra
    await payload.delete({
      collection: 'estoque-obra',
      where: {
        obra: {
          equals: id,
        },
      },
    })

    // 2. Deletar todas as movimentações vinculadas a esta obra
    await payload.delete({
      collection: 'movimentacoes',
      where: {
        obra: {
          equals: id,
        },
      },
    })
  } catch (error) {
    console.error('Erro ao deletar dependências em cascata da obra:', error)
  }
}

export const Obras: CollectionConfig = {
  slug: 'obras',
  admin: {
    useAsTitle: 'nome',
    group: '🏗️ Obras & Canteiros',
    description: 'Cadastro de obras e canteiros de construção civil',
    defaultColumns: ['nome', 'codigo', 'status', 'responsavel', 'publicaAtiva'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeDelete: [cascadeDeleteObra],
  },
  fields: [
    {
      name: 'nome',
      type: 'text',
      label: 'Nome da Obra / Empreendimento',
      required: true,
      admin: {
        description: 'Ex: Residencial Vista do Parque, Edifício Corporativo Alpha',
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug (URL Pública)',
      required: true,
      unique: true,
      admin: {
        description: 'URL amigável para a página pública (ex: residencial-vista-do-parque)',
      },
    },
    {
      name: 'codigo',
      type: 'text',
      label: 'Código da Obra',
      required: true,
      unique: true,
      admin: {
        description: 'Código interno (ex: OBR-001, EMP-2026)',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status da Obra',
      defaultValue: 'em_andamento',
      required: true,
      options: [
        { label: '📐 Em Planejamento / Mobilização', value: 'planejamento' },
        { label: '🏗️ Em Andamento (Ativa)', value: 'em_andamento' },
        { label: '⏸️ Pausada Temporariamente', value: 'pausada' },
        { label: '✅ Concluída / Entregue', value: 'concluida' },
      ],
    },
    {
      name: 'responsavel',
      type: 'text',
      label: 'Engenheiro / Mestre / Almoxarife Responsável',
      required: true,
    },
    {
      name: 'contatoResponsavel',
      type: 'text',
      label: 'Telefone / WhatsApp de Contato',
    },
    {
      name: 'emailContato',
      type: 'text',
      label: 'E-mail de Contato da Obra',
    },
    {
      name: 'endereco',
      type: 'group',
      label: 'Localização do Canteiro de Obras',
      fields: [
        {
          name: 'logradouro',
          type: 'text',
          label: 'Rua / Avenida',
        },
        {
          name: 'numero',
          type: 'text',
          label: 'Número / Complemento',
        },
        {
          name: 'bairro',
          type: 'text',
          label: 'Bairro',
        },
        {
          name: 'cidade',
          type: 'text',
          label: 'Cidade',
        },
        {
          name: 'estado',
          type: 'text',
          label: 'UF (Estado)',
        },
        {
          name: 'cep',
          type: 'text',
          label: 'CEP',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'dataInicio',
          type: 'date',
          label: 'Data de Início',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'previsaoTermino',
          type: 'date',
          label: 'Previsão de Término',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
      ],
    },
    {
      name: 'foto',
      type: 'relationship',
      relationTo: 'media',
      label: 'Foto de Capa da Obra',
    },
    {
      name: 'fotoUrl',
      type: 'text',
      label: 'URL da Foto (Opcional / Fallback)',
    },
    {
      name: 'publicaAtiva',
      type: 'checkbox',
      label: 'Página Pública Ativa (Disponível via URL)',
      defaultValue: true,
      admin: {
        description: 'Se desmarcado, a página pública desta obra ficará inacessível',
      },
    },
    {
      name: 'exibirValores',
      type: 'checkbox',
      label: 'Exibir Valores Financeiros na Página Pública',
      defaultValue: false,
      admin: {
        description: 'Se marcado, os custos unitários e totais serão visíveis na página pública',
      },
    },
    {
      name: 'descricao',
      type: 'textarea',
      label: 'Descrição e Observações Gerais da Obra',
    },
  ],
}
