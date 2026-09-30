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
  Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ArrowLeftRight } from 'lucide-react'

interface FlowData {
  periodo: string
  entradas: number
  saidas: number
  emprestimos: number
}

interface FlowComparisonChartProps {
  data: FlowData[]
}

export function FlowComparisonChart({ data }: FlowComparisonChartProps) {
  return (
    <Card className="shadow-xs border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Comparativo de Fluxo: Entradas vs. Saídas
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Balanço entre abastecimento de compras e consumo nos setores da obra
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {data.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
            <p>Nenhuma movimentação para comparar no período.</p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis
                  dataKey="periodo"
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
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as FlowData
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-800">
                          <p className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                            {item.periodo}
                          </p>
                          <p className="text-emerald-400 flex items-center justify-between gap-4">
                            <span>📥 Entradas / Compras:</span>
                            <span className="font-bold text-white">{item.entradas.toLocaleString('pt-BR')} un</span>
                          </p>
                          <p className="text-blue-400 flex items-center justify-between gap-4">
                            <span>📤 Saídas / Consumo:</span>
                            <span className="font-bold text-white">{item.saidas.toLocaleString('pt-BR')} un</span>
                          </p>
                          {item.emprestimos > 0 && (
                            <p className="text-amber-400 flex items-center justify-between gap-4">
                              <span>🔨 Empréstimos:</span>
                              <span className="font-bold text-white">{item.emprestimos.toLocaleString('pt-BR')} un</span>
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
                  wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
                />
                <Bar dataKey="entradas" name="Entradas (Compras)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="saidas" name="Saídas (Consumo)" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
