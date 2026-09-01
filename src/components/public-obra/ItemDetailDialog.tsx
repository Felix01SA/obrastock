'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  MapPin,
  Tag,
  AlertTriangle,
  History,
  ShieldCheck,
  Wrench,
  Layers,
  Coins,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'

interface ItemDetailDialogProps {
  stockItem: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  itemMovements: any[]
  exibirValores?: boolean
}

export function ItemDetailDialog({
  stockItem,
  open,
  onOpenChange,
  itemMovements,
  exibirValores = false,
}: ItemDetailDialogProps) {
  if (!stockItem) return null

  const item = stockItem.item || {}
  const categoria = typeof item.categoria === 'object' ? item.categoria : null
  const minStock = stockItem.estoqueMinimo ?? item.estoqueMinimoPadrao ?? 0
  const isLowStock = minStock > 0 && stockItem.quantidade <= minStock

  const custoUnitario =
    typeof item.custoUnitario === 'number' ? item.custoUnitario : Number(item.custoUnitario) || 0
  const hasCusto = custoUnitario > 0
  const shouldShowFinancials = Boolean(exibirValores && hasCusto)

  const saldoAtual = Number(stockItem.quantidade) || 0
  const totalEmSaldo = saldoAtual * custoUnitario

  // Total de entradas registradas no histórico desta obra
  const totalEntradasQtd = itemMovements
    .filter((m: any) => m.tipo === 'entrada' || m.tipo === 'transferencia_entrada')
    .reduce((acc: number, m: any) => acc + (Number(m.quantidade) || 0), 0)

  const totalGastoEntradas =
    totalEntradasQtd > 0
      ? totalEntradasQtd * custoUnitario
      : (saldoAtual + (Number(stockItem.quantidadeEmprestada) || 0)) * custoUnitario

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'ferramenta_equipamento':
        return '🔨 Ferramenta / Equipamento'
      case 'epi_seguranca':
        return '🦺 EPI / Proteção'
      default:
        return '🧱 Material Consumível'
    }
  }

  const getMovementBadge = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
      case 'transferencia_entrada':
        return <Badge variant="success">📥 Entrada</Badge>
      case 'saida':
      case 'transferencia_saida':
        return <Badge variant="destructive">📤 Saída</Badge>
      case 'emprestimo_ferramenta':
        return <Badge variant="warning">🔨 Empréstimo</Badge>
      case 'devolucao_ferramenta':
        return <Badge variant="info">🔄 Devolução</Badge>
      default:
        return <Badge variant="outline">⚖️ Ajuste</Badge>
    }
  }

  const imageUrl = item.fotoUrl || (typeof item.foto === 'object' && item.foto?.url) || null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {item.codigo}
            </span>
            <Badge variant="outline">{getTipoLabel(item.tipo)}</Badge>
            {categoria && <Badge variant={categoria.cor || 'secondary'}>{categoria.nome}</Badge>}
          </div>
          <DialogTitle className="text-xl sm:text-2xl text-left">{item.nome}</DialogTitle>
          <DialogDescription className="text-left">
            {item.marca
              ? `Marca / Fabricante: ${item.marca}`
              : 'Detalhes e histórico de movimentações'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Card com Foto e Resumo de Estoque */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            {imageUrl && (
              <div className="sm:col-span-1 aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={item.nome} className="w-full h-full object-cover" />
              </div>
            )}

            <div className={`space-y-3 ${imageUrl ? 'sm:col-span-2' : 'sm:col-span-3'}`}>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">
                    Saldo Disponível
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {stockItem.quantidade}{' '}
                    <span className="text-xs font-normal text-slate-500">{item.unidade}</span>
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">
                    Estoque Mínimo
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {minStock}{' '}
                    <span className="text-xs font-normal text-slate-500">{item.unidade}</span>
                  </p>
                </div>
              </div>

              {stockItem.quantidadeEmprestada > 0 && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-900/40 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Wrench className="w-4 h-4 text-amber-600" />
                    Empréstimos Ativos:
                  </span>
                  <span className="font-bold">
                    {stockItem.quantidadeEmprestada} {item.unidade} em uso no canteiro
                  </span>
                </div>
              )}

              {isLowStock && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/40 flex items-center gap-2 text-xs text-rose-800 dark:text-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Alerta:</strong> O saldo atual está abaixo ou no limite mínimo
                    recomendado.
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  <strong>Localização no Almoxarifado:</strong>{' '}
                  {stockItem.localizacao || 'Almoxarifado Principal'}
                </span>
              </div>
            </div>
          </div>

          {/* Exibição de Valores Financeiros (Condicional à configuração da Obra e existência do Custo) */}
          {shouldShowFinancials && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Valores Financeiros
                </h4>
                <Badge variant="success" className="text-[10px]">
                  Exibição de Valores Ativa
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">
                    Valor por Unidade
                  </p>
                  <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(custoUnitario)}
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">
                      / {item.unidade || 'un'}
                    </span>
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">
                    Total em Saldo ({saldoAtual} {item.unidade || 'un'})
                  </p>
                  <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(totalEmSaldo)}
                  </p>
                </div>

                {totalEntradasQtd > 0 && (
                  <div className="sm:col-span-2 p-2.5 bg-emerald-100/60 dark:bg-emerald-900/30 rounded-lg text-xs text-emerald-900 dark:text-emerald-200 flex flex-wrap items-center justify-between gap-1">
                    <span>
                      Total Gasto em Entradas Registradas ({totalEntradasQtd} {item.unidade || 'un'}
                      ):
                    </span>
                    <span className="font-bold text-sm">{formatCurrency(totalGastoEntradas)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dados Específicos do Item */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            {item.numeroPatrimonio && (
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Tag className="w-4 h-4" /> Nº de Patrimônio
                </span>
                <span className="font-mono font-semibold">{item.numeroPatrimonio}</span>
              </div>
            )}

            {item.estadoConservacao && (
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Estado de Conservação
                </span>
                <span className="font-medium capitalize">{item.estadoConservacao}</span>
              </div>
            )}
          </div>

          {/* Especificações Técnicas */}
          {item.especificacoes && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-400" /> Especificações Técnicas
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 whitespace-pre-line">
                {item.especificacoes}
              </p>
            </div>
          )}

          {/* Histórico Recente de Movimentações deste Item */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-400" /> Histórico Recente deste Item na Obra
            </h4>

            {itemMovements.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Nenhuma movimentação registrada recentemente para este item.
              </p>
            ) : (
              <div className="space-y-2">
                {itemMovements.map((mov) => (
                  <div
                    key={mov.id}
                    className="grid grid-cols-1 sm:grid-cols-3 sm:items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs gap-2"
                  >
                    <div className="flex items-center gap-2">
                      {getMovementBadge(mov.tipo)}
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {mov.quantidade} {item.unidade}
                      </span>
                    </div>

                    <div className="text-slate-600 dark:text-slate-300 flex flex-col flex-1 justify-start items-start ml-2">
                      {mov.solicitante && (
                        <span>
                          Por: <strong>{mov.solicitante}</strong>
                        </span>
                      )}

                      {mov.frenteServico && (
                        <span className="text-slate-400">{mov.frenteServico}</span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono text-end">
                      {format(mov.dataHora, 'Pp', { locale: ptBR })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
