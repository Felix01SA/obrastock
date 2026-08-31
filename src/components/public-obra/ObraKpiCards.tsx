import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Package, AlertTriangle, Wrench, ArrowLeftRight } from 'lucide-react'

interface ObraKpiCardsProps {
  estoques: any[]
  movimentacoes: any[]
}

export function ObraKpiCards({ estoques, movimentacoes }: ObraKpiCardsProps) {
  const totalItens = estoques.length

  const itensBaixoEstoque = estoques.filter((est) => {
    const min = est.estoqueMinimo ?? est.item?.estoqueMinimoPadrao ?? 0
    return min > 0 && (est.quantidade || 0) <= min
  })

  const ferramentasEmprestadas = estoques.reduce((acc, est) => {
    return acc + (est.quantidadeEmprestada || 0)
  }, 0)

  // Movimentações ocorridas hoje
  const hojeStr = new Date().toISOString().slice(0, 10)
  const movsHoje = movimentacoes.filter((m) => {
    if (!m.dataHora) return false
    return m.dataHora.slice(0, 10) === hojeStr
  })

  const kpis = [
    {
      title: 'Itens em Estoque',
      value: totalItens,
      description: 'Materiais, ferramentas e EPIs',
      icon: Package,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      borderColor: 'border-blue-100 dark:border-blue-900/30',
    },
    {
      title: 'Estoque Baixo / Crítico',
      value: itensBaixoEstoque.length,
      description:
        itensBaixoEstoque.length > 0
          ? `${itensBaixoEstoque.length} ${itensBaixoEstoque.length === 1 ? 'item requer' : 'itens requerem'} reposição imediata`
          : 'Nenhum item com estoque crítico',
      icon: AlertTriangle,
      color: itensBaixoEstoque.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400',
      bgColor:
        itensBaixoEstoque.length > 0
          ? 'bg-rose-50 dark:bg-rose-950/40'
          : 'bg-slate-50 dark:bg-slate-900',
      borderColor:
        itensBaixoEstoque.length > 0
          ? 'border-rose-200 dark:border-rose-900/40'
          : 'border-slate-200 dark:border-slate-800',
      badgeAlert: itensBaixoEstoque.length > 0,
    },
    {
      title: 'Ferramentas em Uso',
      value: ferramentasEmprestadas,
      description: 'Empréstimos ativos aos operários',
      icon: Wrench,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-100 dark:border-amber-900/30',
    },
    {
      title: 'Movimentações Hoje',
      value: movsHoje.length,
      description: `${movimentacoes.length} no histórico recente`,
      icon: ArrowLeftRight,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-100 dark:border-emerald-900/30',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <Card
            key={index}
            className={`border ${kpi.borderColor} transition-all duration-200 hover:shadow-md`}
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {kpi.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                    {kpi.value}
                  </span>
                  {kpi.badgeAlert && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 animate-pulse">
                      Atenção
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{kpi.description}</p>
              </div>

              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bgColor} ${kpi.color} shrink-0`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
