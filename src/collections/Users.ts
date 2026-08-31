import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Usuário',
    plural: 'Usuários',
  },
  admin: {
    useAsTitle: 'name',
    group: '👥 Usuários & Acessos',
    defaultColumns: ['name', 'email', 'role'],
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nome Completo',
    },
    {
      name: 'role',
      type: 'select',
      label: 'Função / Papel no Sistema',
      defaultValue: 'almoxarife',
      required: true,
      options: [
        { label: '👑 Administrador Geral', value: 'admin' },
        { label: '🏗️ Engenheiro / Gestor de Obra', value: 'engenheiro' },
        { label: '📦 Almoxarife / Apontador', value: 'almoxarife' },
        { label: '👁️ Visualizador / Auditor', value: 'visualizador' },
      ],
    },
    {
      name: 'obrasPermitidas',
      type: 'relationship',
      relationTo: 'obras',
      hasMany: true,
      label: 'Obras sob sua Responsabilidade',
      admin: {
        description: 'Deixe vazio para dar acesso a todas as obras',
      },
    },
  ],
}
