import type { CollectionConfig } from 'payload'

export const EstoqueObra: CollectionConfig = {
  slug: 'estoque-obra',
  labels: {
    singular: 'Estoque por Obra',
    plural: 'Estoques por Obra',
  },
  admin: {
    useAsTitle: 'id',
    group: '📦 Almoxarifado & Catálogo',
    description: 'Saldo e localização de cada material/ferramenta em cada canteiro de obras',
    defaultColumns: [
      'obra',
      'item',
      'quantidade',
      'estoqueMinimo',
      'quantidadeEmprestada',
      'localizacao',
    ],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'obra',
          type: 'relationship',
          relationTo: 'obras',
          label: 'Obra / Canteiro',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'item',
          type: 'relationship',
          relationTo: 'itens',
          label: 'Material / Ferramenta',
          required: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'quantidade',
          type: 'number',
          label: 'Quantidade em Saldo (Disponível)',
          defaultValue: 0,
          required: true,
          admin: {
            width: '33%',
            description: 'Saldo físico atual disponível no almoxarifado',
          },
        },
        {
          name: 'estoqueMinimo',
          type: 'number',
          label: 'Estoque Mínimo para esta Obra',
          defaultValue: 0,
          admin: {
            width: '33%',
            description: 'Gera alerta visual quando saldo for menor ou igual',
          },
        },
        {
          name: 'quantidadeEmprestada',
          type: 'number',
          label: 'Qtd Emprestada / Em Uso (Ferramentas)',
          defaultValue: 0,
          admin: {
            width: '34%',
            description: 'Ferramentas retiradas temporariamente por operários',
          },
        },
      ],
    },
    {
      name: 'localizacao',
      type: 'text',
      label: 'Localização Física no Almoxarifado da Obra',
      admin: {
        description: 'Ex: Container 1 - Prateleira A, Galpão Central, Pátio Areia',
      },
    },
    {
      name: 'ultimaMovimentacao',
      type: 'date',
      label: 'Data da Última Movimentação',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'observacoes',
      type: 'textarea',
      label: 'Observações do Estoque',
    },
  ],
}
