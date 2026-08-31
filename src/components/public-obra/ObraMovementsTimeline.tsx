'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wrench,
  RotateCcw,
  Scale,
  Clock,
  User,
  MapPin,
  FileText,
  Activity,
} from 'lucide-react'
import { formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ObraMovementsTimelineProps {
  movimentacoes: any[]
}

export function ObraMovementsTimeline({ movimentacoes }: ObraMovementsTimelineProps) {
  const getMovementConfig = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
      case 'transferencia_entrada':
        return {
          label: 'Entrada de Material',
          badgeVariant: 'success' as const,
          icon: ArrowDownLeft,
          iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
          borderColor: 'border-emerald-200 dark:border-emerald-900/40',
        }
      case 'saida':
      case 'transferencia_saida':
        return {
          label: 'Saída / Aplicação',
          badgeVariant: 'destructive' as const,
          icon: ArrowUpRight,
          iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
          borderColor: 'border-rose-200 dark:border-rose-900/40',
        }
      case 'emprestimo_ferramenta':
        return {
          label: 'Empréstimo de Ferramenta',
          badgeVariant: 'warning' as const,
          icon: Wrench,
          iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
          borderColor: 'border-amber-200 dark:border-amber-900/40',
        }
      case 'devolucao_ferramenta':
        return {
          label: 'Devolução de Ferramenta',
          badgeVariant: 'info' as const,
          icon: RotateCcw,
          iconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
          borderColor: 'border-sky-200 dark:border-sky-900/40',
        }
      default:
        return {
          label: 'Ajuste de Saldo',
          badgeVariant: 'outline' as const,
          icon: Scale,
          iconBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
          borderColor: 'border-slate-200 dark:border-slate-800',
        }
    }
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <CardTitle className="text-base sm:text-lg">
            Feed de Movimentações em Tempo Real
          </CardTitle>
        </div>
        <Badge variant="outline" className="text-xs">
          {movimentacoes.length} registros recentes
        </Badge>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {movimentacoes.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm italic">
            Nenhuma movimentação registrada no canteiro de obras até o momento.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {movimentacoes.map((mov, index) => {
              const item = typeof mov.item === 'object' ? mov.item : null
              const config = getMovementConfig(mov.tipo)
              const Icon = config.icon
              const isFirst = index === 0

              return (
                <div
                  key={mov.id || index}
                  className={`relative group transition-all duration-300 ${
                    isFirst ? 'animate-flash' : ''
                  }`}
                >
                  {/* Ponto / Ícone na Linha do Tempo */}
                  <div
                    className={`absolute -left-7.5 top-1 w-6 h-6 rounded-full flex items-center justify-center ${config.iconBg} shadow-xs ring-4 ring-white dark:ring-slate-900`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Card do Evento */}
                  <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={config.badgeVariant} className="text-[11px] font-bold">
                          {config.label}
                        </Badge>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                          {mov.quantidade} {item?.unidade || 'un'}
                        </span>
                        {item && (
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                            • {item.nome}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(mov.dataHora, 'PPPP', { locale: ptBR })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300 pt-1">
                      {mov.solicitante && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            <strong>Responsável:</strong> {mov.solicitante}
                          </span>
                        </div>
                      )}

                      {mov.frenteServico && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            <strong>Frente:</strong> {mov.frenteServico}
                          </span>
                        </div>
                      )}

                      {mov.documentoReferencia && (
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            <strong>Doc:</strong> {mov.documentoReferencia}
                          </span>
                        </div>
                      )}
                    </div>

                    {mov.observacoes && (
                      <p className="text-xs text-slate-500 italic bg-white dark:bg-slate-900/60 p-2 rounded border border-slate-200 dark:border-slate-800 mt-1">
                        {mov.observacoes}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
