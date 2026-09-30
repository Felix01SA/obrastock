'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { PieChart as PieIcon, Layers } from 'lucide-react'

interface CategoryData {
  name: string
  value: number
  percentual: number
  cor: string
}

interface CategoryDistributionChartProps {
  data: CategoryData[]
}

const PALETTE = [
  '#2563eb', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#64748b', // Slate
]

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  const totalVolume = data.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <Card className="shadow-xs border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Consumo por Categoria de Insumo
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Proporção de materiais aplicados por família
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length === 0 || totalVolume === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
            <PieIcon className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
            <p>Nenhuma movimentação categorizada no período.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="h-64 w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as CategoryData
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1 border border-slate-800">
                            <p className="font-bold text-slate-200">{item.name}</p>
                            <p className="text-slate-300">
                              Volume: <strong className="text-white">{item.value.toLocaleString('pt-BR')} un</strong>
                            </p>
                            <p className="text-purple-300">
                              Participação: <strong className="text-white">{item.percentual.toFixed(1)}%</strong>
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.cor || PALETTE[index % PALETTE.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Lista e Legenda de Categorias com Barra de Progresso */}
            <div className="w-full md:w-1/2 space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {data.map((cat, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.cor || PALETTE[idx % PALETTE.length] }}
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                        {cat.name}
                      </span>
                    </div>
                    <div className="text-slate-500 flex items-center gap-2">
                      <span>{cat.value.toLocaleString('pt-BR')} un</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold min-w-[36px] text-right">
                        {cat.percentual.toFixed(1)}%
                      </strong>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${cat.percentual}%`,
                        backgroundColor: cat.cor || PALETTE[idx % PALETTE.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
