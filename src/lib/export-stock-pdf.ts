import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from './utils'

interface ExportStockPDFParams {
  obra: any
  estoques: any[]
  filtroInfo?: string
}

export function exportStockToPDF({ obra, estoques, filtroInfo }: ExportStockPDFParams) {
  // Criar documento PDF em modo paisagem (A4)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // 1. Cabeçalho Azul Superior
  doc.setFillColor(30, 58, 138) // blue-900
  doc.rect(0, 0, pageWidth, 22, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('OBRASTOCK — RELATÓRIO DE ALMOXARIFADO & CONTROLE DE ESTOQUE', 14, 11)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const emitidoEm = `Emitido em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
  doc.text(emitidoEm, pageWidth - 14, 11, { align: 'right' })

  // 2. Informações da Obra
  doc.setTextColor(30, 41, 59) // slate-800
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(`${obra.nome || 'Canteiro de Obras'} (${obra.codigo || 'OBRA'})`, 14, 30)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105) // slate-600

  const enderecoTxt = obra?.endereco
    ? [
        obra.endereco.logradouro && `${obra.endereco.logradouro}, ${obra.endereco.numero || 'S/N'}`,
        obra.endereco.bairro,
        obra.endereco.cidade && `${obra.endereco.cidade}-${obra.endereco.estado || ''}`,
      ]
        .filter(Boolean)
        .join(' • ')
    : 'Localização não informada'

  doc.text(`Localização: ${enderecoTxt}`, 14, 36)
  if (obra.responsavel) {
    doc.text(
      `Responsável Técnico: ${obra.responsavel} ${obra.contatoResponsavel ? `(${obra.contatoResponsavel})` : ''}`,
      14,
      41,
    )
  }

  // 3. Indicadores de Resumo (Cards)
  const totalItens = estoques.length
  const itensBaixoEstoque = estoques.filter((est) => {
    const min = est.estoqueMinimo ?? est.item?.estoqueMinimoPadrao ?? 0
    return min > 0 && (est.quantidade || 0) <= min
  }).length

  const ferramentasEmprestadas = estoques.reduce((acc, est) => {
    return acc + (Number(est.quantidadeEmprestada) || 0)
  }, 0)

  const exibirValores = Boolean(obra?.exibirValores)
  const valorTotalEstoque = estoques.reduce((acc, est) => {
    const custo = Number(est.item?.custoUnitario) || 0
    const qtd = Number(est.quantidade) || 0
    return acc + qtd * custo
  }, 0)

  const cardY = 46
  const cardHeight = 12

  // Box Total de Itens
  doc.setFillColor(241, 245, 249) // slate-100
  doc.roundedRect(14, cardY, 60, cardHeight, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text('TOTAL DE ITENS', 18, cardY + 5)
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  doc.text(`${totalItens} cadastrados`, 18, cardY + 10)

  // Box Estoque Baixo / Alerta
  doc.setFillColor(
    itensBaixoEstoque > 0 ? 254 : 241,
    itensBaixoEstoque > 0 ? 242 : 245,
    itensBaixoEstoque > 0 ? 242 : 249,
  ) // rose-50 ou slate-100
  doc.roundedRect(78, cardY, 65, cardHeight, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(
    itensBaixoEstoque > 0 ? 190 : 100,
    itensBaixoEstoque > 0 ? 18 : 116,
    itensBaixoEstoque > 0 ? 60 : 139,
  ) // rose-700
  doc.text('ESTOQUE BAIXO / CRÍTICO', 82, cardY + 5)
  doc.setFontSize(10)
  doc.text(`${itensBaixoEstoque} itens em alerta`, 82, cardY + 10)

  // Box Ferramentas em Uso
  doc.setFillColor(254, 243, 199) // amber-100
  doc.roundedRect(147, cardY, 65, cardHeight, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(180, 83, 9) // amber-700
  doc.text('FERRAMENTAS EM USO', 151, cardY + 5)
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  doc.text(`${ferramentasEmprestadas} unidades emprestadas`, 151, cardY + 10)

  // Box Valor Total (Se ativo)
  if (exibirValores) {
    doc.setFillColor(236, 253, 245) // emerald-50
    doc.roundedRect(216, cardY, 67, cardHeight, 1.5, 1.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(4, 120, 87) // emerald-700
    doc.text('VALOR TOTAL EM ESTOQUE', 220, cardY + 5)
    doc.setFontSize(10)
    doc.text(formatCurrency(valorTotalEstoque), 220, cardY + 10)
  }

  // 4. Preparação da Tabela
  const tableHeaders = [
    'Código',
    'Descrição do Material / Ferramenta',
    'Categoria',
    'Localização',
    'Saldo',
    'Mínimo',
    'Em Uso',
    'Status',
    ...(exibirValores ? ['Valor Unit.', 'Total (R$)'] : []),
  ]

  const tableRows = estoques.map((est) => {
    const item = est.item || {}
    const categoria = typeof item.categoria === 'object' ? item.categoria?.nome : '-'
    const min = est.estoqueMinimo ?? item.estoqueMinimoPadrao ?? 0
    const qty = Number(est.quantidade) || 0
    const emprestada = Number(est.quantidadeEmprestada) || 0
    const custo = Number(item.custoUnitario) || 0

    let statusText = 'Normal'
    if (qty === 0) {
      statusText = 'ESGOTADO'
    } else if (min > 0 && qty <= min) {
      statusText = 'BAIXO / ALERTA'
    }

    const row = [
      item.codigo || '-',
      item.nome || '-',
      categoria || '-',
      est.localizacao || 'Almoxarifado',
      `${qty} ${item.unidade || 'un'}`,
      `${min} ${item.unidade || 'un'}`,
      emprestada > 0 ? `${emprestada} ${item.unidade || 'un'}` : '-',
      statusText,
    ]

    if (exibirValores) {
      row.push(custo > 0 ? formatCurrency(custo) : '-')
      row.push(custo > 0 ? formatCurrency(qty * custo) : '-')
    }

    return row
  })

  // 5. Renderizar Tabela com AutoTable
  autoTable(doc, {
    startY: cardY + cardHeight + 5,
    head: [tableHeaders],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 26 }, // Código
      1: { cellWidth: exibirValores ? 55 : 75 }, // Descrição
      2: { cellWidth: 28 }, // Categoria
      3: { cellWidth: 38 }, // Localização
      4: { halign: 'right', fontStyle: 'bold', cellWidth: 22 }, // Saldo
      5: { halign: 'right', cellWidth: 20 }, // Mínimo
      6: { halign: 'right', cellWidth: 20 }, // Em Uso
      7: { halign: 'center', cellWidth: 25 }, // Status
      ...(exibirValores
        ? {
            8: { halign: 'right', cellWidth: 22 }, // Custo Unit
            9: { halign: 'right', fontStyle: 'bold', cellWidth: 25 }, // Total
          }
        : {}),
    },
    didParseCell: (data) => {
      // Colorir a coluna de status
      if (data.section === 'body' && data.column.index === 7) {
        const text = String(data.cell.raw)
        if (text === 'ESGOTADO') {
          data.cell.styles.textColor = [225, 29, 72] // rose-600
          data.cell.styles.fontStyle = 'bold'
        } else if (text === 'BAIXO / ALERTA') {
          data.cell.styles.textColor = [217, 119, 6] // amber-600
          data.cell.styles.fontStyle = 'bold'
        } else {
          data.cell.styles.textColor = [16, 185, 129] // emerald-500
        }
      }
    },
    didDrawPage: (data) => {
      // Rodapé em todas as páginas
      const str = `Página ${data.pageNumber}`
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text(str, pageWidth - 14, pageHeight - 8, { align: 'right' })
      doc.text(
        'ObraStock — Sistema de Gestão de Almoxarifado e Canteiro de Obras',
        14,
        pageHeight - 8,
      )
    },
  })

  // 6. Bloco de Assinaturas na última página
  // @ts-ignore
  const finalY = doc.lastAutoTable?.finalY || 160

  if (finalY + 30 < pageHeight) {
    const signY = pageHeight - 22
    doc.setDrawColor(148, 163, 184)
    doc.line(30, signY, 110, signY)
    doc.line(pageWidth - 110, signY, pageWidth - 30, signY)

    doc.setFontSize(8)
    doc.setTextColor(71, 85, 105)
    doc.text('Almoxarife / Responsável pela Conferência', 70, signY + 4, { align: 'center' })
    doc.text('Engenheiro / Gestor do Canteiro de Obras', pageWidth - 70, signY + 4, {
      align: 'center',
    })
  }

  // 7. Salvar e disparar download do PDF
  const nomeArquivo = `Relatorio_Estoque_${(obra.codigo || obra.slug || 'obra').replace(/[^a-zA-Z0-9_-]/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`
  doc.save(nomeArquivo)
}
