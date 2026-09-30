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
  Cell,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { HardHat } from 'lucide-react'

interface ServiceFrontData {
  frente: string
  consumo: number
  percentual: number
}

interface ServiceFrontChartProps {
  data: ServiceFrontData[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b']

export function ServiceFrontChart({ data }: ServiceFrontChartProps) {
  const topFrentes = data.slice(0, 6)

  return (
    <Card className="shadow-xs border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <HardHat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Consumo por Frente de Serviço & Pavimento
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Distribuição dos insumos aplicados em cada setor da construção
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {topFrentes.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
            <p>Nenhuma frente de serviço identificada nas saídas do período.</p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topFrentes}
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="frente"
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fill: '#475569', fontSize: 11 }}
                  width={110}
                  tickFormatter={(val) => (val.length > 15 ? `${val.substring(0, 14)}…` : val)}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as ServiceFrontData
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1 border border-slate-800">
                          <p className="font-bold text-amber-300">{item.frente}</p>
                          <p className="text-slate-200">
                            Volume Consumido:{' '}
                            <strong className="text-white">{item.consumo.toLocaleString('pt-BR')} un</strong>
                          </p>
                          <p className="text-blue-300">
                            Representatividade:{' '}
                            <strong className="text-white">{item.percentual.toFixed(1)}%</strong>
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="consumo" radius={[0, 4, 4, 0]} maxBarSize={22}>
                  {topFrentes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
