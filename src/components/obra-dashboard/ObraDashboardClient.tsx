'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { DashboardHeader } from './DashboardHeader'
import { DashboardKpiSummary } from './DashboardKpiSummary'
import { DashboardFilters, PeriodoPreset } from './DashboardFilters'
import { WeeklyConsumptionChart } from './charts/WeeklyConsumptionChart'
import { WeeklyTrendChart } from './charts/WeeklyTrendChart'
import { MonthlyConsumptionChart } from './charts/MonthlyConsumptionChart'
import { CategoryDistributionChart } from './charts/CategoryDistributionChart'
import { TopMaterialsChart } from './charts/TopMaterialsChart'
import { FlowComparisonChart } from './charts/FlowComparisonChart'
import { ServiceFrontChart } from './charts/ServiceFrontChart'
import { DashboardTable } from './DashboardTable'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { exportDashboardToPDF } from '@/lib/export-dashboard-pdf'
import { subDays, subWeeks, startOfWeek, endOfWeek, startOfMonth, isAfter, isBefore, parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LayoutDashboard, TrendingUp, Layers, HardHat, ListFilter } from 'lucide-react'

interface ObraDashboardClientProps {
  obra: any
  initialEstoques: any[]
  initialMovimentacoes: any[]
  categorias: any[]
}

const CATEGORY_COLORS: Record<string, string> = {
  blue: '#2563eb',
  amber: '#f59e0b',
  emerald: '#10b981',
  purple: '#8b5cf6',
  rose: '#f43f5e',
  slate: '#64748b',
}

export function ObraDashboardClient({
  obra,
  initialEstoques,
  initialMovimentacoes,
  categorias,
}: ObraDashboardClientProps) {
  const [estoques, setEstoques] = useState<any[]>(initialEstoques || [])
  const [movimentacoes, setMovimentacoes] = useState<any[]>(initialMovimentacoes || [])
  const [isConnected, setIsConnected] = useState(false)
  const [lastEventTime, setLastEventTime] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState('todas')
  const [selectedPeriodo, setSelectedPeriodo] = useState<PeriodoPreset>('30d')
  const [selectedFrente, setSelectedFrente] = useState('todas')

  // Real-time SSE listener
  const handleRealtimeEvent = useCallback((eventData: any) => {
    setLastEventTime(new Date())

    if (eventData.type === 'connected') {
      setIsConnected(true)
      return
    }

    if (eventData.type === 'movement_created' && eventData.payload) {
      const newMovement = eventData.payload
      setMovimentacoes((prev) => {
        const exists = prev.some((m) => m.id === newMovement.id)
        if (exists) return prev
        return [newMovement, ...prev]
      })
    }

    if (eventData.type === 'stock_update' && eventData.payload) {
      const { itemId, quantidade, quantidadeEmprestada } = eventData.payload
      setEstoques((prev) =>
        prev.map((est) => {
          const currentItemId = typeof est.item === 'object' ? est.item?.id : est.item
          if (currentItemId === itemId) {
            return {
              ...est,
              quantidade,
              quantidadeEmprestada,
              ultimaMovimentacao: new Date().toISOString(),
            }
          }
          return est
        }),
      )
    }
  }, [])

  useEffect(() => {
    if (!obra?.slug) return

    let eventSource: EventSource | null = null

    const connectSSE = () => {
      try {
        eventSource = new EventSource(`/api/realtime/obra/${obra.slug}`)
        eventSource.onopen = () => setIsConnected(true)
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            handleRealtimeEvent(data)
          } catch (e) {
            console.error('Erro ao processar SSE:', e)
          }
        }
        eventSource.onerror = () => {
          setIsConnected(false)
          eventSource?.close()
        }
      } catch (err) {
        console.error('Erro de conexão SSE:', err)
      }
    }

    connectSSE()

    return () => {
      if (eventSource) eventSource.close()
    }
  }, [obra?.slug, handleRealtimeEvent])

  // Recarregar dados manualmente
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      window.location.reload()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Lista única de frentes de serviço
  const frentesDisponiveis = useMemo(() => {
    const set = new Set<string>()
    movimentacoes.forEach((m) => {
      if (m.frenteServico && typeof m.frenteServico === 'string' && m.frenteServico.trim()) {
        set.add(m.frenteServico.trim())
      }
    })
    return Array.from(set).sort()
  }, [movimentacoes])

  // Filtragem de Movimentações
  const filteredMovimentacoes = useMemo(() => {
    const now = new Date()

    return movimentacoes.filter((m) => {
      const mDate = m.dataHora ? new Date(m.dataHora) : null

      // Filtro de Período
      if (mDate) {
        if (selectedPeriodo === '7d' && isBefore(mDate, subDays(now, 7))) return false
        if (selectedPeriodo === '30d' && isBefore(mDate, subDays(now, 30))) return false
        if (selectedPeriodo === '90d' && isBefore(mDate, subDays(now, 90))) return false
        if (selectedPeriodo === 'mes_atual' && isBefore(mDate, startOfMonth(now))) return false
      }

      // Filtro de Categoria
      if (selectedCategoria !== 'todas') {
        const itemObj = typeof m.item === 'object' ? m.item : null
        const itemCatId =
          itemObj && typeof itemObj.categoria === 'object'
            ? itemObj.categoria?.id
            : itemObj?.categoria
        if (itemCatId !== selectedCategoria) return false
      }

      // Filtro de Frente de Serviço
      if (selectedFrente !== 'todas') {
        if ((m.frenteServico || '').trim() !== selectedFrente) return false
      }

      // Busca por Nome do Material / Código
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const itemObj = typeof m.item === 'object' ? m.item : null
        const itemNome = itemObj?.nome?.toLowerCase() || ''
        const itemCodigo = itemObj?.codigo?.toLowerCase() || ''
        const solicitante = m.solicitante?.toLowerCase() || ''
        if (!itemNome.includes(query) && !itemCodigo.includes(query) && !solicitante.includes(query)) {
          return false
        }
      }

      return true
    })
  }, [movimentacoes, selectedPeriodo, selectedCategoria, selectedFrente, searchTerm])

  // Cálculo de KPIs
  const kpiData = useMemo(() => {
    let totalConsumo = 0
    let totalEntradas = 0
    let totalEmprestimos = 0
    let custoTotalConsumo = 0
    const frenteCount: Record<string, number> = {}

    filteredMovimentacoes.forEach((m) => {
      const qtd = Number(m.quantidade) || 0
      const item = typeof m.item === 'object' ? m.item : null
      const custoUnit = Number(item?.custoUnitario) || 0

      if (m.tipo === 'saida' || m.tipo === 'transferencia_saida') {
        totalConsumo += qtd
        custoTotalConsumo += qtd * custoUnit

        if (m.frenteServico) {
          frenteCount[m.frenteServico] = (frenteCount[m.frenteServico] || 0) + qtd
        }
      } else if (m.tipo === 'entrada' || m.tipo === 'transferencia_entrada') {
        totalEntradas += qtd
      } else if (m.tipo === 'emprestimo_ferramenta') {
        totalEmprestimos += 1
      }
    })

    // Frente em destaque
    let frenteDestaque = ''
    let maxFrenteVol = 0
    Object.entries(frenteCount).forEach(([frente, vol]) => {
      if (vol > maxFrenteVol) {
        maxFrenteVol = vol
        frenteDestaque = frente
      }
    })

    // Itens críticos (abaixo do estoque mínimo)
    const itensCriticos = estoques.filter((est) => {
      const min = est.estoqueMinimo ?? est.item?.estoqueMinimoPadrao ?? 0
      return min > 0 && (est.quantidade || 0) <= min
    }).length

    // Taxa diária média de consumo
    let diasDivisor = 30
    if (selectedPeriodo === '7d') diasDivisor = 7
    else if (selectedPeriodo === '90d') diasDivisor = 90
    else if (selectedPeriodo === 'mes_atual') diasDivisor = new Date().getDate()
    else if (selectedPeriodo === 'tudo') diasDivisor = 60

    const taxaConsumoDiario = totalConsumo / Math.max(1, diasDivisor)

    return {
      totalConsumo,
      totalEntradas,
      totalEmprestimos,
      custoTotalConsumo,
      frenteDestaque,
      frenteDestaqueVolume: maxFrenteVol,
      itensCriticos,
      taxaConsumoDiario,
    }
  }, [filteredMovimentacoes, estoques, selectedPeriodo])

  // 1. Dados para Gráfico Semanal / Diário (Últimos 7 a 14 dias)
  const weeklyChartData = useMemo(() => {
    const daysMap: Record<string, { consumo: number; entradas: number; label: string }> = {}
    const numDays = selectedPeriodo === '7d' ? 7 : 14
    const today = new Date()

    for (let i = numDays - 1; i >= 0; i--) {
      const d = subDays(today, i)
      const key = format(d, 'yyyy-MM-dd')
      const label = format(d, 'dd/MM', { locale: ptBR })
      daysMap[key] = { consumo: 0, entradas: 0, label }
    }

    filteredMovimentacoes.forEach((m) => {
      if (!m.dataHora) return
      const key = m.dataHora.slice(0, 10)
      if (daysMap[key]) {
        const qtd = Number(m.quantidade) || 0
        if (m.tipo === 'saida' || m.tipo === 'transferencia_saida') {
          daysMap[key].consumo += qtd
        } else if (m.tipo === 'entrada' || m.tipo === 'transferencia_entrada') {
          daysMap[key].entradas += qtd
        }
      }
    })

    return Object.entries(daysMap).map(([key, val]) => ({
      dia: val.label,
      dataFormatada: format(parseISO(key), "EEEE, dd 'de' MMMM", { locale: ptBR }),
      consumo: val.consumo,
      entradas: val.entradas,
    }))
  }, [filteredMovimentacoes, selectedPeriodo])

  // 1.5. Dados para Gráfico de Tendência Semanal (Últimas 8 Semanas com Média Móvel)
  const weeklyTrendData = useMemo(() => {
    const today = new Date()
    const weeks: Array<{
      start: Date
      end: Date
      labelCurto: string
      semana: string
      periodoCompleto: string
      consumo: number
      entradas: number
    }> = []

    for (let i = 7; i >= 0; i--) {
      const d = subWeeks(today, i)
      const start = startOfWeek(d, { weekStartsOn: 1 })
      const end = endOfWeek(d, { weekStartsOn: 1 })
      const weekIndex = 8 - i

      weeks.push({
        start,
        end,
        labelCurto: `Sem ${weekIndex} (${format(start, 'dd/MM')})`,
        semana: `Semana ${weekIndex}`,
        periodoCompleto: `${format(start, 'dd/MM')} a ${format(end, 'dd/MM')}`,
        consumo: 0,
        entradas: 0,
      })
    }

    filteredMovimentacoes.forEach((m) => {
      if (!m.dataHora) return
      const mDate = new Date(m.dataHora)
      const qtd = Number(m.quantidade) || 0

      for (const w of weeks) {
        if (mDate >= w.start && mDate <= w.end) {
          if (m.tipo === 'saida' || m.tipo === 'transferencia_saida') {
            w.consumo += qtd
          } else if (m.tipo === 'entrada' || m.tipo === 'transferencia_entrada') {
            w.entradas += qtd
          }
          break
        }
      }
    })

    return weeks.map((w, idx, arr) => {
      const windowStart = Math.max(0, idx - 2)
      const windowSlice = arr.slice(windowStart, idx + 1)
      const mediaMovel =
        windowSlice.reduce((sum, item) => sum + item.consumo, 0) / windowSlice.length

      let variacao: number | null = null
      if (idx > 0 && arr[idx - 1].consumo > 0) {
        variacao = ((w.consumo - arr[idx - 1].consumo) / arr[idx - 1].consumo) * 100
      }

      return {
        semana: w.semana,
        labelCurto: w.labelCurto,
        periodoCompleto: w.periodoCompleto,
        consumo: w.consumo,
        entradas: w.entradas,
        mediaMovel: Math.round(mediaMovel * 10) / 10,
        variacao,
      }
    })
  }, [filteredMovimentacoes])

  // 2. Dados para Gráfico Mensal
  const monthlyChartData = useMemo(() => {
    const monthsMap: Record<string, { consumo: number; entradas: number; mesExtenso: string }> = {}
    const today = new Date()

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const key = format(d, 'yyyy-MM')
      const shortLabel = format(d, 'MMM/yy', { locale: ptBR })
      const fullLabel = format(d, 'MMMM yyyy', { locale: ptBR })
      monthsMap[key] = { consumo: 0, entradas: 0, mesExtenso: fullLabel }
    }

    filteredMovimentacoes.forEach((m) => {
      if (!m.dataHora) return
      const key = m.dataHora.slice(0, 7)
      if (monthsMap[key]) {
        const qtd = Number(m.quantidade) || 0
        if (m.tipo === 'saida' || m.tipo === 'transferencia_saida') {
          monthsMap[key].consumo += qtd
        } else if (m.tipo === 'entrada' || m.tipo === 'transferencia_entrada') {
          monthsMap[key].entradas += qtd
        }
      }
    })

    return Object.entries(monthsMap).map(([key, val]) => ({
      mes: format(parseISO(`${key}-01`), 'MMM/yy', { locale: ptBR }),
      mesExtenso: val.mesExtenso,
      consumo: val.consumo,
      entradas: val.entradas,
    }))
  }, [filteredMovimentacoes])

  // 3. Dados para Gráfico de Distribuição por Categoria
  const categoryChartData = useMemo(() => {
    const catTotals: Record<string, { nome: string; value: number; cor: string }> = {}
    let totalAll = 0

    filteredMovimentacoes.forEach((m) => {
      if (m.tipo !== 'saida' && m.tipo !== 'transferencia_saida') return
      const qtd = Number(m.quantidade) || 0
      const item = typeof m.item === 'object' ? m.item : null
      const cat = item && typeof item.categoria === 'object' ? item.categoria : null

      const catId = cat?.id || 'outros'
      const catNome = cat?.nome || 'Geral / Outros'
      const catCorKey = cat?.cor || 'blue'
      const corHex = CATEGORY_COLORS[catCorKey] || '#2563eb'

      if (!catTotals[catId]) {
        catTotals[catId] = { nome: catNome, value: 0, cor: corHex }
      }
      catTotals[catId].value += qtd
      totalAll += qtd
    })

    return Object.values(catTotals)
      .sort((a, b) => b.value - a.value)
      .map((c) => ({
        name: c.nome,
        value: c.value,
        percentual: totalAll > 0 ? (c.value / totalAll) * 100 : 0,
        cor: c.cor,
      }))
  }, [filteredMovimentacoes])

  // 4. Top Materiais Mais Consumidos
  const topMaterialsData = useMemo(() => {
    const materialMap: Record<
      string,
      { id: string; nome: string; codigo: string; quantidade: number; unidade: string; custoTotal: number }
    > = {}

    filteredMovimentacoes.forEach((m) => {
      if (m.tipo !== 'saida' && m.tipo !== 'transferencia_saida') return
      const qtd = Number(m.quantidade) || 0
      const item = typeof m.item === 'object' ? m.item : null
      if (!item) return

      const itemId = item.id || item.codigo || item.nome
      const custoUnit = Number(item.custoUnitario) || 0

      if (!materialMap[itemId]) {
        materialMap[itemId] = {
          id: itemId,
          nome: item.nome,
          codigo: item.codigo || '',
          quantidade: 0,
          unidade: item.unidade || 'un',
          custoTotal: 0,
        }
      }

      materialMap[itemId].quantidade += qtd
      materialMap[itemId].custoTotal += qtd * custoUnit
    })

    return Object.values(materialMap).sort((a, b) => b.quantidade - a.quantidade)
  }, [filteredMovimentacoes])

  // 5. Comparativo de Fluxo (Entradas vs Saídas)
  const flowComparisonData = useMemo(() => {
    const groups: Record<string, { entradas: number; saidas: number; emprestimos: number }> = {}
    const today = new Date()

    // 4 semanas recentes
    for (let i = 3; i >= 0; i--) {
      const label = `Semana ${4 - i}`
      groups[label] = { entradas: 0, saidas: 0, emprestimos: 0 }
    }

    filteredMovimentacoes.forEach((m) => {
      if (!m.dataHora) return
      const mDate = new Date(m.dataHora)
      const diffDays = Math.floor((today.getTime() - mDate.getTime()) / (1000 * 3600 * 24))
      let weekKey = 'Semana 4'
      if (diffDays <= 7) weekKey = 'Semana 4'
      else if (diffDays <= 14) weekKey = 'Semana 3'
      else if (diffDays <= 21) weekKey = 'Semana 2'
      else if (diffDays <= 28) weekKey = 'Semana 1'
      else return

      const qtd = Number(m.quantidade) || 0
      if (m.tipo === 'entrada' || m.tipo === 'transferencia_entrada') {
        groups[weekKey].entradas += qtd
      } else if (m.tipo === 'saida' || m.tipo === 'transferencia_saida') {
        groups[weekKey].saidas += qtd
      } else if (m.tipo === 'emprestimo_ferramenta') {
        groups[weekKey].emprestimos += qtd
      }
    })

    return Object.entries(groups).map(([periodo, val]) => ({
      periodo,
      entradas: val.entradas,
      saidas: val.saidas,
      emprestimos: val.emprestimos,
    }))
  }, [filteredMovimentacoes])

  // 6. Consumo por Frente de Serviço
  const serviceFrontData = useMemo(() => {
    const frenteMap: Record<string, number> = {}
    let total = 0

    filteredMovimentacoes.forEach((m) => {
      if (m.tipo !== 'saida' && m.tipo !== 'transferencia_saida') return
      const qtd = Number(m.quantidade) || 0
      const frente = (m.frenteServico || 'Almoxarifado Central').trim()
      frenteMap[frente] = (frenteMap[frente] || 0) + qtd
      total += qtd
    })

    return Object.entries(frenteMap)
      .map(([frente, consumo]) => ({
        frente,
        consumo,
        percentual: total > 0 ? (consumo / total) * 100 : 0,
      }))
      .sort((a, b) => b.consumo - a.consumo)
  }, [filteredMovimentacoes])

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      selectedCategoria !== 'todas' ||
      selectedPeriodo !== '30d' ||
      selectedFrente !== 'todas',
  )

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedCategoria('todas')
    setSelectedPeriodo('30d')
    setSelectedFrente('todas')
  }

  const handleExportPDF = () => {
    const labelsMap: Record<PeriodoPreset, string> = {
      '7d': 'Últimos 7 dias',
      '30d': 'Últimos 30 dias',
      '90d': 'Últimos 90 dias',
      mes_atual: 'Este Mês',
      tudo: 'Todo o Histórico',
    }

    exportDashboardToPDF({
      obra,
      kpis: kpiData,
      topMaterials: topMaterialsData,
      categoryBreakdown: categoryChartData.map((c) => ({
        categoria: c.name,
        quantidade: c.value,
        percentual: c.percentual,
      })),
      movimentacoes: filteredMovimentacoes,
      periodoLabel: labelsMap[selectedPeriodo],
    })
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16">
      {/* Cabeçalho do Dashboard */}
      <DashboardHeader
        obra={obra}
        isConnected={isConnected}
        lastEventTime={lastEventTime}
        onExportPDF={handleExportPDF}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Barra de Filtros Interativos */}
        <DashboardFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategoria={selectedCategoria}
          onCategoriaChange={setSelectedCategoria}
          categorias={categorias}
          selectedPeriodo={selectedPeriodo}
          onPeriodoChange={setSelectedPeriodo}
          selectedFrente={selectedFrente}
          onFrenteChange={setSelectedFrente}
          frentesDisponiveis={frentesDisponiveis}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Resumo de KPIs Executivos */}
        <DashboardKpiSummary kpis={kpiData} exibirValores={obra?.exibirValores} />

        {/* Abas de Visualização do Painel */}
        <Tabs defaultValue="visao-geral" className="w-full space-y-6">
          <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-xs overflow-x-auto flex-nowrap w-full justify-start sm:justify-center">
            <TabsTrigger value="visao-geral" className="gap-1.5 text-xs font-semibold py-2 px-3 sm:px-4">
              <LayoutDashboard className="w-4 h-4 text-blue-600" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="tendencias" className="gap-1.5 text-xs font-semibold py-2 px-3 sm:px-4">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Evolução & Fluxo</span>
            </TabsTrigger>
            <TabsTrigger value="categorias" className="gap-1.5 text-xs font-semibold py-2 px-3 sm:px-4">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Categorias & Top Insumos</span>
            </TabsTrigger>
            <TabsTrigger value="frentes" className="gap-1.5 text-xs font-semibold py-2 px-3 sm:px-4">
              <HardHat className="w-4 h-4 text-amber-600" />
              <span>Frentes de Obra</span>
            </TabsTrigger>
            <TabsTrigger value="tabela" className="gap-1.5 text-xs font-semibold py-2 px-3 sm:px-4">
              <ListFilter className="w-4 h-4 text-slate-600" />
              <span>Histórico Analítico</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba 1: Visão Geral */}
          <TabsContent value="visao-geral" className="space-y-6">
            <WeeklyTrendChart data={weeklyTrendData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeeklyConsumptionChart data={weeklyChartData} />
              <CategoryDistributionChart data={categoryChartData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopMaterialsChart data={topMaterialsData} exibirValores={obra?.exibirValores} />
              <FlowComparisonChart data={flowComparisonData} />
            </div>

            <DashboardTable
              movimentacoes={filteredMovimentacoes}
              exibirValores={obra?.exibirValores}
              obraNome={obra?.nome || 'Obra'}
            />
          </TabsContent>

          {/* Aba 2: Tendências & Fluxo */}
          <TabsContent value="tendencias" className="space-y-6">
            <WeeklyTrendChart data={weeklyTrendData} />
            <WeeklyConsumptionChart data={weeklyChartData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyConsumptionChart data={monthlyChartData} />
              <FlowComparisonChart data={flowComparisonData} />
            </div>
          </TabsContent>

          {/* Aba 3: Categorias & Insumos */}
          <TabsContent value="categorias" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryDistributionChart data={categoryChartData} />
              <TopMaterialsChart data={topMaterialsData} exibirValores={obra?.exibirValores} />
            </div>
          </TabsContent>

          {/* Aba 4: Frentes de Serviço */}
          <TabsContent value="frentes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ServiceFrontChart data={serviceFrontData} />
              <TopMaterialsChart data={topMaterialsData} exibirValores={obra?.exibirValores} />
            </div>
          </TabsContent>

          {/* Aba 5: Tabela Detalhada */}
          <TabsContent value="tabela" className="space-y-6">
            <DashboardTable
              movimentacoes={filteredMovimentacoes}
              exibirValores={obra?.exibirValores}
              obraNome={obra?.nome || 'Obra'}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
