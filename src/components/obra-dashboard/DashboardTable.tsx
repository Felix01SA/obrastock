'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wrench,
  RotateCcw,
  Scale,
  Truck,
  Search,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MapPin,
} from 'lucide-react'
import { formatDate } from 'date-fns'

interface DashboardTableProps {
  movimentacoes: any[]
  exibirValores?: boolean
  obraNome: string
}

export function DashboardTable({
  movimentacoes,
  exibirValores = false,
  obraNome,
}: DashboardTableProps) {
  const [tableSearch, setTableSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const filteredMovs = useMemo(() => {
    if (!tableSearch.trim()) return movimentacoes
    const query = tableSearch.toLowerCase()
    return movimentacoes.filter((m) => {
      const itemNome = typeof m.item === 'object' ? m.item?.nome?.toLowerCase() : ''
      const itemCodigo = typeof m.item === 'object' ? m.item?.codigo?.toLowerCase() : ''
      const solicitante = m.solicitante?.toLowerCase() || ''
      const frente = m.frenteServico?.toLowerCase() || ''
      const docRef = m.documentoReferencia?.toLowerCase() || ''

      return (
        itemNome.includes(query) ||
        itemCodigo.includes(query) ||
        solicitante.includes(query) ||
        frente.includes(query) ||
        docRef.includes(query)
      )
    })
  }, [movimentacoes, tableSearch])

  const totalPages = Math.ceil(filteredMovs.length / pageSize) || 1
  const paginatedMovs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredMovs.slice(start, start + pageSize)
  }, [filteredMovs, currentPage])

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'saida':
        return (
          <Badge variant="rose" className="text-[11px] gap-1">
            <ArrowUpRight className="w-3 h-3 text-rose-500" />
            Saída / Consumo
          </Badge>
        )
      case 'entrada':
        return (
          <Badge variant="emerald" className="text-[11px] gap-1">
            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
            Entrada (Compra)
          </Badge>
        )
      case 'emprestimo_ferramenta':
        return (
          <Badge variant="amber" className="text-[11px] gap-1">
            <Wrench className="w-3 h-3 text-amber-600" />
            Empréstimo
          </Badge>
        )
      case 'devolucao_ferramenta':
        return (
          <Badge variant="info" className="text-[11px] gap-1">
            <RotateCcw className="w-3 h-3 text-sky-600" />
            Devolução
          </Badge>
        )
      case 'ajuste_inventario':
        return (
          <Badge variant="purple" className="text-[11px] gap-1">
            <Scale className="w-3 h-3 text-purple-600" />
            Ajuste Balanço
          </Badge>
        )
      case 'transferencia_saida':
      case 'transferencia_entrada':
        return (
          <Badge variant="slate" className="text-[11px] gap-1">
            <Truck className="w-3 h-3 text-slate-600" />
            Transferência
          </Badge>
        )
      default:
        return <Badge variant="outline">{tipo}</Badge>
    }
  }

  const exportCSV = () => {
    if (filteredMovs.length === 0) return

    const headers = [
      'Data/Hora',
      'Tipo',
      'Material',
      'Código SKU',
      'Quantidade',
      'Unidade',
      'Solicitante',
      'Frente de Serviço',
      'Documento/NF',
    ]

    const rows = filteredMovs.map((m) => {
      const itemNome = typeof m.item === 'object' ? m.item?.nome : 'Material'
      const itemCodigo = typeof m.item === 'object' ? m.item?.codigo || '' : ''
      const unidade = typeof m.item === 'object' ? m.item?.unidade || 'un' : 'un'
      const dataStr = m.dataHora ? formatDate(new Date(m.dataHora), 'dd/MM/yyyy HH:mm') : ''

      return [
        `"${dataStr}"`,
        `"${m.tipo}"`,
        `"${itemNome?.replace(/"/g, '""') || ''}"`,
        `"${itemCodigo}"`,
        m.quantidade || 0,
        `"${unidade}"`,
        `"${m.solicitante?.replace(/"/g, '""') || ''}"`,
        `"${m.frenteServico?.replace(/"/g, '""') || ''}"`,
        `"${m.documentoReferencia || ''}"`,
      ].join(',')
    })

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `movimentacoes-${obraNome.toLowerCase().replace(/\s+/g, '-')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="shadow-xs border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Detalhamento de Movimentações Analisadas
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Histórico pontual de todas as saídas, requisições e entradas
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-60">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Filtrar tabela..."
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-8 h-8 text-xs bg-slate-50 dark:bg-slate-800/50"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              className="h-8 gap-1.5 text-xs text-slate-700 dark:text-slate-200 hover:border-emerald-300"
              title="Exportar dados da tabela para planilha CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/80">
              <TableRow>
                <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-300 py-3">
                  Data/Hora
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Tipo
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Material / Insumo
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-300 text-right">
                  Quantidade
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Solicitante / Operário
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Frente / Aplicação
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMovs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                    Nenhuma movimentação localizada com os filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMovs.map((m) => {
                  const item = typeof m.item === 'object' ? m.item : null
                  const itemNome = item?.nome || 'Material'
                  const itemCodigo = item?.codigo || ''
                  const unidade = item?.unidade || 'un'
                  const dataStr = m.dataHora
                    ? formatDate(new Date(m.dataHora), 'dd/MM/yyyy HH:mm')
                    : '-'

                  return (
                    <TableRow key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-400 py-2.5 whitespace-nowrap">
                        {dataStr}
                      </TableCell>
                      <TableCell className="py-2.5 whitespace-nowrap">{getTipoBadge(m.tipo)}</TableCell>
                      <TableCell className="py-2.5">
                        <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {itemNome}
                        </div>
                        {itemCodigo && (
                          <div className="font-mono text-[10px] text-slate-400">
                            Cód: {itemCodigo}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-900 dark:text-slate-100 text-right py-2.5 whitespace-nowrap">
                        {m.quantidade?.toLocaleString('pt-BR')} {unidade}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-300 py-2.5">
                        {m.solicitante ? (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[140px]">{m.solicitante}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-300 py-2.5">
                        {m.frenteServico ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{m.frenteServico}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 text-xs text-slate-500">
            <div>
              Mostrando{' '}
              <strong>
                {(currentPage - 1) * pageSize + 1} -{' '}
                {Math.min(currentPage * pageSize, filteredMovs.length)}
              </strong>{' '}
              de <strong>{filteredMovs.length}</strong> registros
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-7 px-2 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Anterior</span>
              </Button>
              <span className="px-2 font-medium">
                Pág. {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-7 px-2 text-xs"
              >
                <span className="hidden sm:inline">Próxima</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
