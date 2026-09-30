'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { TrendingUp, BarChart3 } from 'lucide-react'

interface MonthlyData {
  mes: string
  mesExtenso: string
  consumo: number
  entradas: number
}

interface MonthlyConsumptionChartProps {
  data: MonthlyData[]
}

export function MonthlyConsumptionChart({ data }: MonthlyConsumptionChartProps) {
  const totalAno = data.reduce((acc, curr) => acc + curr.consumo, 0)
  const mediaMensal = data.length > 0 ? Math.round(totalAno / data.length) : 0

  return (
    <Card className="shadow-xs border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Tendência & Evolução Mensal de Consumo
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Curva de utilização de insumos e materiais ao longo dos meses
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-slate-400">Média Mensal:</span>{' '}
              <strong className="text-slate-900 dark:text-slate-100 font-bold">
                {mediaMensal.toLocaleString('pt-BR')} un/mês
              </strong>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {data.length === 0 || totalAno === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
            <BarChart3 className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
            <p>Histórico mensal insuficiente para gerar a curva de tendência.</p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaMonthlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="areaInflowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis
                  dataKey="mes"
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as MonthlyData
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-800">
                          <p className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                            {item.mesExtenso}
                          </p>
                          <p className="text-emerald-400 flex items-center justify-between gap-4">
                            <span>Saídas / Consumo:</span>
                            <span className="font-bold text-white">{item.consumo.toLocaleString('pt-BR')} un</span>
                          </p>
                          <p className="text-blue-400 flex items-center justify-between gap-4">
                            <span>Entradas / Compras:</span>
                            <span className="font-bold text-white">{item.entradas.toLocaleString('pt-BR')} un</span>
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="consumo"
                  name="Saídas / Consumo"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#areaMonthlyGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="entradas"
                  name="Entradas / Recebimento"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#areaInflowGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
