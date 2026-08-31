import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'
import { realtimeHub } from '../lib/realtime-hub'

const syncStockAfterMovement: CollectionAfterChangeHook = async ({
  doc,
  req: { payload },
  operation,
}) => {
  try {
    const obraId = typeof doc.obra === 'object' ? doc.obra?.id : doc.obra
    const itemId = typeof doc.item === 'object' ? doc.item?.id : doc.item
    const quantidade = Number(doc.quantidade) || 0

    if (!obraId || !itemId || !quantidade) return

    // Buscar a obra para obter o slug para o evento em tempo real
    let obraSlug = typeof doc.obra === 'object' ? doc.obra?.slug : null
    let obraNome = typeof doc.obra === 'object' ? doc.obra?.nome : ''
    if (!obraSlug) {
      const obraDoc = await payload.findByID({
        collection: 'obras',
        id: obraId,
      })
      obraSlug = obraDoc?.slug
      obraNome = obraDoc?.nome || ''
    }

    // Buscar ou criar o registro de EstoqueObra
    const existingStock = await payload.find({
      collection: 'estoque-obra',
      where: {
        and: [{ obra: { equals: obraId } }, { item: { equals: itemId } }],
      },
      limit: 1,
    })

    const currentRecord = existingStock.docs[0]
    let newQty = currentRecord?.quantidade || 0
    let newEmprestado = currentRecord?.quantidadeEmprestada || 0

    switch (doc.tipo) {
      case 'entrada':
      case 'transferencia_entrada':
        newQty += quantidade
        break
      case 'saida':
      case 'transferencia_saida':
        newQty = Math.max(0, newQty - quantidade)
        break
      case 'emprestimo_ferramenta':
        newQty = Math.max(0, newQty - quantidade)
        newEmprestado += quantidade
        break
      case 'devolucao_ferramenta':
        newQty += quantidade
        newEmprestado = Math.max(0, newEmprestado - quantidade)
        break
      case 'ajuste_inventario':
        newQty = Math.max(0, quantidade)
        break
      default:
        break
    }

    const updatePayload = {
      quantidade: newQty,
      quantidadeEmprestada: newEmprestado,
      ultimaMovimentacao: doc.dataHora || new Date().toISOString(),
    }

    if (currentRecord) {
      await payload.update({
        collection: 'estoque-obra',
        id: currentRecord.id,
        data: updatePayload,
      })
    } else {
      await payload.create({
        collection: 'estoque-obra',
        data: {
          obra: obraId,
          item: itemId,
          estoqueMinimo: 0,
          localizacao: 'Almoxarifado Principal',
          ...updatePayload,
        },
      })
    }

    // Disparar broadcast em tempo real para os clientes conectados na obra
    if (obraSlug) {
      realtimeHub.broadcast(obraSlug, {
        type: 'movement_created',
        payload: {
          id: doc.id,
          tipo: doc.tipo,
          quantidade: doc.quantidade,
          solicitante: doc.solicitante,
          frenteServico: doc.frenteServico,
          dataHora: doc.dataHora,
          obraNome,
          item: doc.item,
        },
      })

      realtimeHub.broadcast(obraSlug, {
        type: 'stock_update',
        payload: {
          itemId,
          quantidade: newQty,
          quantidadeEmprestada: newEmprestado,
        },
      })
    }
  } catch (error) {
    console.error('Erro ao sincronizar estoque após movimentação:', error)
  }
}

export const Movimentacoes: CollectionConfig = {
  slug: 'movimentacoes',
  labels: {
    singular: 'Movimentação',
    plural: 'Movimentações',
  },
  admin: {
    useAsTitle: 'id',
    group: '🔄 Movimentações & Histórico',
    description: 'Registro de entradas, saídas, empréstimos e devoluções no almoxarifado',
    defaultColumns: [
      'dataHora',
      'tipo',
      'obra',
      'item',
      'quantidade',
      'solicitante',
      'frenteServico',
    ],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [syncStockAfterMovement],
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
          name: 'tipo',
          type: 'select',
          label: 'Tipo de Movimentação',
          required: true,
          defaultValue: 'saida',
          options: [
            { label: '📥 Entrada de Material (Compra/Recebimento)', value: 'entrada' },
            { label: '📤 Saída / Consumo na Obra', value: 'saida' },
            {
              label: '🔨 Empréstimo de Ferramenta (Saída p/ Operário)',
              value: 'emprestimo_ferramenta',
            },
            { label: '🔄 Devolução de Ferramenta ao Almoxarifado', value: 'devolucao_ferramenta' },
            { label: '⚖️ Ajuste de Inventário / Balanço', value: 'ajuste_inventario' },
            { label: '🚚 Transferência para Outra Obra (Saída)', value: 'transferencia_saida' },
            { label: '🚛 Transferência de Outra Obra (Entrada)', value: 'transferencia_entrada' },
          ],
          admin: {
            width: '60%',
          },
        },
        {
          name: 'quantidade',
          type: 'number',
          label: 'Quantidade Movimentada',
          required: true,
          min: 0.01,
          admin: {
            width: '40%',
            step: 0.01,
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'dataHora',
          type: 'date',
          label: 'Data e Hora da Movimentação',
          defaultValue: () => new Date().toISOString(),
          required: true,
          admin: {
            width: '50%',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'solicitante',
          type: 'text',
          label: 'Retirado por / Solicitante / Operário',
          admin: {
            width: '50%',
            description: 'Nome do colaborador ou empreiteiro que retirou',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'frenteServico',
          type: 'text',
          label: 'Frente de Serviço / Local de Aplicação',
          admin: {
            width: '50%',
            description: 'Ex: Torre B - 4º Pavimento, Fundação, Elétrica Térreo',
          },
        },
        {
          name: 'documentoReferencia',
          type: 'text',
          label: 'Nº da Nota Fiscal / Pedido / Requisição',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'comprovante',
      type: 'relationship',
      relationTo: 'media',
      label: 'Foto do Comprovante / Recibo / NF Assinada',
    },
    {
      name: 'observacoes',
      type: 'textarea',
      label: 'Observações / Motivo',
    },
    {
      name: 'registradoPor',
      type: 'relationship',
      relationTo: 'users',
      label: 'Almoxarife / Usuário Responsável pelo Registro',
      admin: {
        readOnly: false,
      },
    },
  ],
}
