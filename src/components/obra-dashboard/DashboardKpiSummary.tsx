'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  TrendingDown,
  TrendingUp,
  PackageMinus,
  PackagePlus,
  DollarSign,
  AlertTriangle,
  HardHat,
  Wrench,
} from 'lucide-react'

interface DashboardKpiSummaryProps {
  kpis: {
    totalConsumo: number
    totalEntradas: number
    totalEmprestimos: number
    custoTotalConsumo: number
    frenteDestaque: string
    frenteDestaqueVolume: number
    itensCriticos: number
    taxaConsumoDiario: number
  }
  exibirValores?: boolean
}

export function DashboardKpiSummary({ kpis, exibirValores = false }: DashboardKpiSummaryProps) {
  const cards = [
    {
      title: 'Consumo no Período',
      value: `${kpis.totalConsumo.toLocaleString('pt-BR')} un`,
      sub: `${kpis.taxaConsumoDiario.toFixed(1)} un/dia de média`,
      icon: PackageMinus,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-100 dark:border-rose-900/30',
    },
    {
      title: 'Entradas & Compras',
      value: `${kpis.totalEntradas.toLocaleString('pt-BR')} un`,
      sub: 'Materiais recebidos no canteiro',
      icon: PackagePlus,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-100 dark:border-emerald-900/30',
    },
    ...(exibirValores
      ? [
          {
            title: 'Custo de Consumo Estimado',
            value: `R$ ${kpis.custoTotalConsumo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: 'Baseado no custo unitário cadastrado',
            icon: DollarSign,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/40',
            border: 'border-blue-100 dark:border-blue-900/30',
          },
        ]
      : []),
    {
      title: 'Frente com Maior Consumo',
      value: kpis.frenteDestaque || 'Almoxarifado Geral',
      sub: kpis.frenteDestaqueVolume > 0 ? `${kpis.frenteDestaqueVolume.toLocaleString('pt-BR')} un aplicadas` : 'Sem movimentação',
      icon: HardHat,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-100 dark:border-amber-900/30',
    },
    {
      title: 'Alerta de Reposição',
      value: `${kpis.itensCriticos} ${kpis.itensCriticos === 1 ? 'item crítico' : 'itens críticos'}`,
      sub: kpis.itensCriticos > 0 ? 'Saldo abaixo do mínimo' : 'Estoque regularizado',
      icon: AlertTriangle,
      color: kpis.itensCriticos > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400',
      bg: kpis.itensCriticos > 0 ? 'bg-rose-50 dark:bg-rose-950/40' : 'bg-slate-50 dark:bg-slate-900',
      border: kpis.itensCriticos > 0 ? 'border-rose-200 dark:border-rose-900/40' : 'border-slate-200 dark:border-slate-800',
    },
  ]

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cards.length > 4 ? '5' : '4'} gap-4`}>
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <Card
            key={idx}
            className={`border ${card.border} transition-all duration-200 hover:shadow-md`}
          >
            <CardContent className="p-4 sm:p-5 flex items-start justify-between">
              <div className="space-y-1 overflow-hidden pr-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                  {card.title}
                </p>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 truncate">
                  {card.value}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{card.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg} ${card.color} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
