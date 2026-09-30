'use client'

import React from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export interface WeeklyTrendItem {
  semana: string
  labelCurto: string
  periodoCompleto: string
  consumo: number
  entradas: number
  mediaMovel: number
  variacao: number | null
}

interface WeeklyTrendChartProps {
  data: WeeklyTrendItem[]
}

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const totalPeriodo = data.reduce((acc, curr) => acc + curr.consumo, 0)
  const mediaSemanal = data.length > 0 ? Math.round(totalPeriodo / data.length) : 0

  // Última semana vs semana anterior
  const ultimasDuasSemanas = data.slice(-2)
  const ultimaSemana = ultimasDuasSemanas[1] || ultimasDuasSemanas[0]
  const semanaAnterior = ultimasDuasSemanas.length > 1 ? ultimasDuasSemanas[0] : null

  let variacaoUltimaSemana = 0
  if (semanaAnterior && semanaAnterior.consumo > 0 && ultimaSemana) {
    variacaoUltimaSemana =
      ((ultimaSemana.consumo - semanaAnterior.consumo) / semanaAnterior.consumo) * 100
  }

  const getTrendBadge = () => {
    if (variacaoUltimaSemana > 5) {
      return (
        <Badge variant="rose" className="text-xs gap-1 font-semibold">
          <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
          <span>+{variacaoUltimaSemana.toFixed(1)}% vs. sem. anterior (Demanda em Alta)</span>
        </Badge>
      )
    }
    if (variacaoUltimaSemana < -5) {
      return (
        <Badge variant="emerald" className="text-xs gap-1 font-semibold">
          <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
          <span>{variacaoUltimaSemana.toFixed(1)}% vs. sem. anterior (Redução de Ritmo)</span>
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="text-xs gap-1 font-semibold">
        <Minus className="w-3.5 h-3.5 text-slate-500" />
        <span>Ritmo de Consumo Estável</span>
      </Badge>
    )
  }

  return (
    <Card className="shadow-xs border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Tendência Semanal de Consumo & Média Móvel
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Evolução semana a semana com curva de tendência suavizada por média móvel
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {getTrendBadge()}
            <div className="hidden md:flex items-center text-xs bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 mr-1">Média Semanal:</span>
              <strong className="text-slate-900 dark:text-slate-100 font-bold">
                {mediaSemanal.toLocaleString('pt-BR')} un/sem
              </strong>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        {data.length === 0 || totalPeriodo === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
            <TrendingUp className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
            <p>Dados insuficientes para gerar a curva de tendência semanal.</p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.35} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis
                  dataKey="labelCurto"
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(59, 130, 246, 0.06)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as WeeklyTrendItem
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-800 min-w-[200px]">
                          <p className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                            {item.semana} ({item.periodoCompleto})
                          </p>
                          <p className="text-blue-300 flex items-center justify-between gap-4">
                            <span>Consumo da Semana:</span>
                            <span className="font-bold text-white">
                              {item.consumo.toLocaleString('pt-BR')} un
                            </span>
                          </p>
                          <p className="text-amber-300 flex items-center justify-between gap-4">
                            <span>Média Móvel (Tendência):</span>
                            <span className="font-bold text-white">
                              {item.mediaMovel.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} un
                            </span>
                          </p>
                          {item.variacao !== null && (
                            <p
                              className={`flex items-center justify-between gap-4 ${
                                item.variacao > 0 ? 'text-rose-300' : 'text-emerald-300'
                              }`}
                            >
                              <span>Variação vs. Anterior:</span>
                              <span className="font-bold">
                                {item.variacao > 0 ? `+${item.variacao.toFixed(1)}%` : `${item.variacao.toFixed(1)}%`}
                              </span>
                            </p>
                          )}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
                />
                <Bar
                  dataKey="consumo"
                  name="Volume Consumido"
                  fill="url(#barTrendGradient)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
                <Line
                  type="monotone"
                  dataKey="mediaMovel"
                  name="Linha de Tendência (Média Móvel)"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#f59e0b', strokeWidth: 1, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#f59e0b' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
