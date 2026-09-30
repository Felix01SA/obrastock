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
import { Award, Package } from 'lucide-react'

interface TopMaterialItem {
  id: string
  nome: string
  codigo: string
  quantidade: number
  unidade: string
  custoTotal: number
}

interface TopMaterialsChartProps {
  data: TopMaterialItem[]
  exibirValores?: boolean
}

export function TopMaterialsChart({ data, exibirValores = false }: TopMaterialsChartProps) {
  const top10 = data.slice(0, 8)

  return (
    <Card className="shadow-xs border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Top Materiais Mais Consumidos
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Ranking dos insumos de maior volume de requisição no canteiro
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {top10.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
            <Package className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
            <p>Nenhum material consumido no período filtrado.</p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={top10}
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="nome"
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fill: '#475569', fontSize: 11 }}
                  width={110}
                  tickFormatter={(val) => (val.length > 15 ? `${val.substring(0, 14)}…` : val)}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(245, 158, 11, 0.08)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as TopMaterialItem
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1 border border-slate-800">
                          <p className="font-bold text-amber-400">{item.nome}</p>
                          {item.codigo && <p className="text-slate-400 text-[10px]">Código: {item.codigo}</p>}
                          <p className="text-slate-200">
                            Total Consumido:{' '}
                            <strong className="text-white">
                              {item.quantidade.toLocaleString('pt-BR')} {item.unidade}
                            </strong>
                          </p>
                          {exibirValores && item.custoTotal > 0 && (
                            <p className="text-emerald-300">
                              Custo Estimado:{' '}
                              <strong className="text-white">
                                R$ {item.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </strong>
                            </p>
                          )}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="quantidade" radius={[0, 4, 4, 0]} maxBarSize={22}>
                  {top10.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === 0
                          ? '#f59e0b'
                          : index === 1
                            ? '#3b82f6'
                            : index === 2
                              ? '#10b981'
                              : '#64748b'
                      }
                    />
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
