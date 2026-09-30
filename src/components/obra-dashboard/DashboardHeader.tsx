'use client'

import React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Building2,
  FileDown,
  Boxes,
  RotateCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  HardHat,
  Share2,
} from 'lucide-react'

interface DashboardHeaderProps {
  obra: any
  isConnected: boolean
  lastEventTime: Date | null
  onExportPDF: () => void
  onRefresh: () => void
  isRefreshing?: boolean
}

export function DashboardHeader({
  obra,
  isConnected,
  lastEventTime,
  onExportPDF,
  onRefresh,
  isRefreshing = false,
}: DashboardHeaderProps) {
  const [copied, setCopied] = React.useState(false)

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return (
          <Badge variant="success" className="text-xs px-2.5 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
            Obra em Andamento
          </Badge>
        )
      case 'planejamento':
        return (
          <Badge variant="info" className="text-xs px-2.5 py-0.5">
            <Clock className="w-3 h-3 mr-1" />
            Planejamento
          </Badge>
        )
      case 'pausada':
        return (
          <Badge variant="warning" className="text-xs px-2.5 py-0.5">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pausada
          </Badge>
        )
      case 'concluida':
        return (
          <Badge variant="secondary" className="text-xs px-2.5 py-0.5">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Concluída
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Informações da Obra */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {obra?.codigo || 'OBRA'}
              </span>
              {getStatusBadge(obra?.status || 'em_andamento')}

              {/* Status SSE em Tempo Real */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse-subtle' : 'bg-amber-400'
                  }`}
                />
                <span className="text-slate-600 dark:text-slate-300">
                  {isConnected ? 'Analytics em Tempo Real' : 'Conectando...'}
                </span>
                {lastEventTime && (
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    • {lastEventTime.toLocaleTimeString('pt-BR')}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
                <HardHat className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Dashboard de Consumo • {obra?.nome}</span>
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Painel de inteligência de insumos, curva de demanda semanal/mensal e controle do almoxarifado
            </p>
          </div>

          {/* Botões de Ação e Navegação */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {/* Atalho para o Estoque da Obra */}
            <Link href={`/obras/${obra?.slug}`}>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-slate-700 dark:text-slate-200 hover:border-blue-300"
                title="Voltar para a listagem de estoque físico"
              >
                <Boxes className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Ver Estoque Físico</span>
              </Button>
            </Link>

            {/* Exportar Relatório PDF */}
            <Button
              variant="outline"
              size="sm"
              onClick={onExportPDF}
              className="gap-1.5 text-xs text-slate-700 dark:text-slate-200 hover:border-rose-300"
              title="Gerar PDF do relatório consolidado de consumo"
            >
              <FileDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Exportar PDF</span>
            </Button>

            {/* Compartilhar Link */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-1.5 text-xs text-slate-700 dark:text-slate-200"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{copied ? 'Copiado!' : 'Compartilhar'}</span>
            </Button>

            {/* Atualizar Dados */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Recarregar dados do painel"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
