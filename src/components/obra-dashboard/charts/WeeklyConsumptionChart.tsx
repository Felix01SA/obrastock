'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Calendar, TrendingUp } from 'lucide-react'

interface DailyData {
  dia: string
  dataFormatada: string
  consumo: number
  entradas: number
}

interface WeeklyConsumptionChartProps {
  data: DailyData[]
}

export function WeeklyConsumptionChart({ data }: WeeklyConsumptionChartProps) {
  const totalPeriodo = data.reduce((acc, curr) => acc + curr.consumo, 0)
  const maxConsumo = Math.max(...data.map((d) => d.consumo), 0)
  const diaPico = data.find((d) => d.consumo === maxConsumo)?.dataFormatada || '-'

  return (
    <Card className="shadow-xs border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Consumo Diário & Semanal de Materiais
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Volume total de saídas e insumos aplicados no canteiro dia a dia
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-slate-400">Total Período:</span>{' '}
              <strong className="text-slate-900 dark:text-slate-100 font-bold">
                {totalPeriodo.toLocaleString('pt-BR')} un
              </strong>
            </div>
            {maxConsumo > 0 && (
              <div className="hidden sm:block border-l pl-3 border-slate-300 dark:border-slate-700">
                <span className="text-slate-400">Pico:</span>{' '}
                <strong className="text-blue-600 dark:text-blue-400 font-semibold">{diaPico}</strong>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {data.length === 0 || totalPeriodo === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
            <TrendingUp className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
            <p>Nenhuma saída ou consumo de material registrado neste período.</p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barConsumptionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis
                  dataKey="dia"
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
                  cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as DailyData
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1 border border-slate-800">
                          <p className="font-semibold text-slate-200">{item.dataFormatada}</p>
                          <p className="text-blue-300 flex items-center justify-between gap-4">
                            <span>Saídas / Consumo:</span>
                            <span className="font-bold text-white">{item.consumo.toLocaleString('pt-BR')} un</span>
                          </p>
                          {item.entradas > 0 && (
                            <p className="text-emerald-300 flex items-center justify-between gap-4">
                              <span>Entradas / Compras:</span>
                              <span className="font-bold text-white">{item.entradas.toLocaleString('pt-BR')} un</span>
                            </p>
                          )}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar
                  dataKey="consumo"
                  name="Consumo"
                  fill="url(#barConsumptionGradient)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
