import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate } from 'date-fns'

interface ExportDashboardPDFProps {
  obra: any
  kpis: {
    totalConsumo: number
    totalEntradas: number
    totalEmprestimos: number
    custoTotalConsumo: number
    frenteDestaque: string
    itensCriticos: number
  }
  topMaterials: Array<{
    nome: string
    codigo: string
    quantidade: number
    unidade: string
    custoTotal: number
  }>
  categoryBreakdown: Array<{
    categoria: string
    quantidade: number
    percentual: number
  }>
  movimentacoes: any[]
  periodoLabel: string
}

export function exportDashboardToPDF({
  obra,
  kpis,
  topMaterials,
  categoryBreakdown,
  movimentacoes,
  periodoLabel,
}: ExportDashboardPDFProps) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const now = new Date()
  const dataEmissao = formatDate(now, 'dd/MM/yyyy HH:mm')

  // Cabeçalho institucional
  doc.setFillColor(30, 41, 59) // slate-800
  doc.rect(0, 0, 210, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('OBRASTOCK - RELATÓRIO ANALÍTICO DE CONSUMO', 14, 12)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(203, 213, 225)
  doc.text(
    `Obra: ${obra?.nome || 'N/A'} (${obra?.codigo || 'S/C'}) | Período: ${periodoLabel}`,
    14,
    19,
  )
  doc.text(`Emitido em: ${dataEmissao}`, 14, 24)

  // Resumo Executivo / KPIs
  let currentY = 36
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('1. Indicadores Chave de Desempenho (KPIs)', 14, currentY)
  currentY += 4

  const kpiData = [
    [
      'Total Consumido (Saídas)',
      `${kpis.totalConsumo.toLocaleString('pt-BR')} unidades/itens`,
      'Total Recebido (Entradas)',
      `${kpis.totalEntradas.toLocaleString('pt-BR')} unidades/itens`,
    ],
    [
      'Empréstimos Realizados',
      `${kpis.totalEmprestimos} registros`,
      'Frente com Maior Consumo',
      kpis.frenteDestaque || 'Geral',
    ],
  ]

  if (obra?.exibirValores && kpis.custoTotalConsumo > 0) {
    kpiData.push([
      'Custo Estimado do Consumo',
      `R$ ${kpis.custoTotalConsumo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Itens em Nível Crítico',
      `${kpis.itensCriticos} itens`,
    ])
  }

  autoTable(doc, {
    startY: currentY,
    body: kpiData,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 },
      1: { cellWidth: 45 },
      2: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 },
      3: { cellWidth: 45 },
    },
    margin: { left: 14, right: 14 },
  })

  currentY = (doc as any).lastAutoTable.finalY + 8

  // Top Materiais Consumidos
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('2. Ranking dos Materiais Mais Consumidos', 14, currentY)
  currentY += 4

  const topRows = topMaterials.map((m, idx) => [
    `#${idx + 1}`,
    m.nome,
    m.codigo || '-',
    `${m.quantidade.toLocaleString('pt-BR')} ${m.unidade}`,
    obra?.exibirValores && m.custoTotal > 0
      ? `R$ ${m.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      : '-',
  ])

  autoTable(doc, {
    startY: currentY,
    head: [['Pos.', 'Material / Insumo', 'Código / SKU', 'Qtd Consumida', 'Custo Total Estimado']],
    body: topRows.length > 0 ? topRows : [['-', 'Nenhum consumo no período', '-', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 75 },
      2: { cellWidth: 30 },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  })

  currentY = (doc as any).lastAutoTable.finalY + 8

  // Consumo por Categoria
  if (currentY > 230) {
    doc.addPage()
    currentY = 20
  }

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('3. Distribuição por Categoria', 14, currentY)
  currentY += 4

  const catRows = categoryBreakdown.map((c) => [
    c.categoria,
    `${c.quantidade.toLocaleString('pt-BR')} un`,
    `${c.percentual.toFixed(1)}%`,
  ])

  autoTable(doc, {
    startY: currentY,
    head: [['Categoria', 'Volume Total Consumido', 'Representatividade (%)']],
    body: catRows.length > 0 ? catRows : [['Nenhuma categoria encontrada', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 55, halign: 'right' },
      2: { cellWidth: 45, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  })

  // Detalhamento de Movimentações Recentes
  doc.addPage()
  currentY = 20
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('4. Histórico Detalhado de Movimentações no Período', 14, currentY)
  currentY += 4

  const movRows = movimentacoes.slice(0, 50).map((m) => {
    const itemNome = typeof m.item === 'object' ? m.item?.nome : 'Material'
    const unidade = typeof m.item === 'object' ? m.item?.unidade || 'un' : 'un'
    const dataStr = m.dataHora ? formatDate(new Date(m.dataHora), 'dd/MM/yy HH:mm') : '-'

    let tipoFormatado = m.tipo
    if (m.tipo === 'saida') tipoFormatado = 'Saída / Consumo'
    else if (m.tipo === 'entrada') tipoFormatado = 'Entrada'
    else if (m.tipo === 'emprestimo_ferramenta') tipoFormatado = 'Empréstimo'
    else if (m.tipo === 'devolucao_ferramenta') tipoFormatado = 'Devolução'

    return [
      dataStr,
      tipoFormatado,
      itemNome,
      `${m.quantidade || 0} ${unidade}`,
      m.solicitante || '-',
      m.frenteServico || '-',
    ]
  })

  autoTable(doc, {
    startY: currentY,
    head: [['Data/Hora', 'Tipo', 'Material', 'Qtd', 'Solicitante', 'Frente de Serviço']],
    body: movRows.length > 0 ? movRows : [['-', 'Nenhuma movimentação encontrada', '-', '-', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 28 },
      2: { cellWidth: 50 },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 32 },
      5: { cellWidth: 30 },
    },
    margin: { left: 14, right: 14 },
  })

  // Rodapé em todas as páginas
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7.5)
    doc.setTextColor(148, 163, 184)
    doc.text(
      `ObraStock • ${obra?.nome || 'Obra'} • Página ${i} de ${pageCount}`,
      14,
      290,
    )
    doc.text('Relatório gerado automaticamente pelo Sistema ObraStock', 125, 290)
  }

  doc.save(`dashboard-consumo-${obra?.slug || 'obra'}-${formatDate(now, 'yyyyMMdd-HHmm')}.pdf`)
}
