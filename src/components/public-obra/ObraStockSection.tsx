'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Search,
  LayoutGrid,
  List,
  AlertTriangle,
  CheckCircle2,
  Package,
  Wrench,
  ShieldAlert,
  MapPin,
  Eye,
  SlidersHorizontal,
} from 'lucide-react'
import { Progress } from '../ui/progress'

interface ObraStockSectionProps {
  estoques: any[]
  categorias: any[]
  onSelectItem: (stockItem: any) => void
}

export function ObraStockSection({ estoques, categorias, onSelectItem }: ObraStockSectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('todos')
  const [selectedCategory, setSelectedCategory] = useState<string>('todas')
  const [selectedStatus, setSelectedStatus] = useState<string>('todos')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const filteredItems = useMemo(() => {
    return estoques.filter((est) => {
      const item = est.item || {}
      const categoria = typeof item.categoria === 'object' ? item.categoria : null

      // Busca por texto
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchName = item.nome?.toLowerCase().includes(query)
        const matchCode = item.codigo?.toLowerCase().includes(query)
        const matchBrand = item.marca?.toLowerCase().includes(query)
        const matchLoc = est.localizacao?.toLowerCase().includes(query)
        if (!matchName && !matchCode && !matchBrand && !matchLoc) {
          return false
        }
      }

      // Filtro por tipo
      if (selectedType !== 'todos') {
        if (item.tipo !== selectedType) return false
      }

      // Filtro por categoria
      if (selectedCategory !== 'todas') {
        const catSlug = categoria?.slug || categoria?.id
        if (catSlug !== selectedCategory && categoria?.id !== selectedCategory) {
          return false
        }
      }

      // Filtro por status de estoque
      const min = est.estoqueMinimo ?? item.estoqueMinimoPadrao ?? 0
      const qty = est.quantidade || 0

      if (selectedStatus === 'baixo') {
        if (min === 0 || qty > min || qty === 0) return false
      } else if (selectedStatus === 'zerado') {
        if (qty > 0) return false
      } else if (selectedStatus === 'normal') {
        if (min > 0 && qty <= min) return false
        if (qty === 0) return false
      } else if (selectedStatus === 'emprestado') {
        if (!est.quantidadeEmprestada || est.quantidadeEmprestada <= 0) return false
      }

      return true
    })
  }, [estoques, searchTerm, selectedType, selectedCategory, selectedStatus])

  const getStockStatus = (est: any) => {
    const item = est.item || {}
    const min = est.estoqueMinimo ?? item.estoqueMinimoPadrao ?? 0
    const qty = est.quantidade || 0

    if (qty === 0) {
      return {
        label: 'Esgotado',
        variant: 'destructive' as const,
        colorClass: 'bg-rose-500',
        textColor: 'text-rose-700 dark:text-rose-400',
        percentage: 0,
      }
    }

    if (min > 0 && qty <= min) {
      return {
        label: 'Estoque Baixo',
        variant: 'warning' as const,
        colorClass: 'bg-amber-500',
        textColor: 'text-amber-700 dark:text-amber-400',
        percentage: Math.min(100, Math.round((qty / (min * 2)) * 100)),
      }
    }

    return {
      label: 'Normal',
      variant: 'success' as const,
      colorClass: 'bg-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      percentage: Math.min(100, Math.max(30, Math.round((qty / (min > 0 ? min * 2 : 50)) * 100))),
    }
  }

  return (
    <div className="space-y-6">
      {/* Controles de Busca e Filtros */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Linha 1: Input de Busca + Toggle de Visualização */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por nome do material, ferramenta, código SKU ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Visualização em Grade de Cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Visualização em Tabela Detalhada"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Linha 2: Filtros por Tipo (Tabs rápidas) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Tipos:
          </span>
          {[
            { id: 'todos', label: 'Todos os Itens', icon: Package },
            { id: 'material_consumivel', label: 'Insumos / Materiais', icon: Package },
            { id: 'ferramenta_equipamento', label: 'Ferramentas', icon: Wrench },
            { id: 'epi_seguranca', label: 'EPIs & Segurança', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon
            const active = selectedType === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Linha 3: Filtro por Status e Categorias */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="todos">Todos os Níveis</option>
              <option value="normal">Estoque Normal</option>
              <option value="baixo">⚠️ Estoque Baixo / Alerta</option>
              <option value="zerado">🚫 Esgotado / Zerado</option>
              <option value="emprestado">🔨 Com Empréstimos Ativos</option>
            </select>
          </div>

          {categorias.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Categoria:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <option value="todas">Todas as Categorias</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.slug || cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="ml-auto text-slate-500 font-medium">
            Exibindo <strong>{filteredItems.length}</strong> de {estoques.length} itens
          </div>
        </div>
      </div>

      {/* Exibição dos Itens */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Nenhum item encontrado
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Nenhum material ou ferramenta corresponde aos filtros selecionados. Tente ajustar os
            termos de busca ou filtros.
          </p>
          {(searchTerm ||
            selectedType !== 'todos' ||
            selectedStatus !== 'todos' ||
            selectedCategory !== 'todas') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('')
                setSelectedType('todos')
                setSelectedStatus('todos')
                setSelectedCategory('todas')
              }}
              className="mt-4"
            >
              Limpar Todos os Filtros
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Visualização em Grade de Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((est) => {
            const item = est.item || {}
            const categoria = typeof item.categoria === 'object' ? item.categoria : null
            const status = getStockStatus(est)
            const imageUrl =
              item.fotoUrl || (typeof item.foto === 'object' && item.foto?.url) || null
            const minStock = est.estoqueMinimo ?? item.estoqueMinimoPadrao ?? 0

            return (
              <Card
                key={est.id}
                onClick={() => onSelectItem(est)}
                className="group pt-0 relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                {/* Imagem do Item */}
                <div className="relative aspect-16/10 bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100 dark:border-slate-800">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={item.nome}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Package className="w-10 h-10 opacity-40" />
                    </div>
                  )}

                  {/* Badge de Status de Estoque */}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={status.variant}
                      className="shadow-xs backdrop-blur-xs font-bold text-[11px]"
                    >
                      {status.label}
                    </Badge>
                  </div>

                  {/* Código SKU */}
                  <div className="absolute bottom-2 left-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-white backdrop-blur-xs">
                      {item.codigo}
                    </span>
                  </div>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {categoria && (
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        {categoria.nome}
                      </span>
                    )}

                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {item.nome}
                    </h4>

                    {item.marca && <p className="text-xs text-slate-500 mt-0.5">{item.marca}</p>}
                  </div>

                  {/* Barra de Nível de Saldo */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Saldo Atual:</span>
                      <span className="text-base font-black text-slate-900 dark:text-slate-100">
                        {est.quantidade}{' '}
                        <span className="text-xs font-normal text-slate-500">{item.unidade}</span>
                      </span>
                    </div>

                    <div className="w-full overflow-hidden">
                      <Progress value={status.percentage} variant={status.variant} />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Mínimo: {minStock} {item.unidade}
                      </span>
                      {est.quantidadeEmprestada > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          {est.quantidadeEmprestada} em uso
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Localização Física */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center gap-1 truncate" title={est.localizacao}>
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{est.localizacao || 'Almoxarifado'}</span>
                    </div>

                    <span className="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-3 h-3" /> Ver
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Visualização em Tabela Detalhada */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Foto / Cód</TableHead>
                <TableHead>Item / Material</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead className="text-right">Saldo Disponível</TableHead>
                <TableHead className="text-right">Mínimo</TableHead>
                <TableHead className="text-right">Em Uso</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((est) => {
                const item = est.item || {}
                const categoria = typeof item.categoria === 'object' ? item.categoria : null
                const status = getStockStatus(est)
                const imageUrl =
                  item.fotoUrl || (typeof item.foto === 'object' && item.foto?.url) || null
                const minStock = est.estoqueMinimo ?? item.estoqueMinimoPadrao ?? 0

                return (
                  <TableRow
                    key={est.id}
                    onClick={() => onSelectItem(est)}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <TableCell>
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl}
                            alt={item.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {item.nome}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {item.codigo} {item.marca && `• ${item.marca}`}
                      </div>
                    </TableCell>

                    <TableCell>
                      {categoria ? (
                        <Badge variant={categoria.cor || 'secondary'} className="text-[11px]">
                          {categoria.nome}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{est.localizacao || 'Almoxarifado'}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-black text-slate-900 dark:text-slate-100">
                      {est.quantidade}{' '}
                      <span className="text-xs font-normal text-slate-500">{item.unidade}</span>
                    </TableCell>

                    <TableCell className="text-right text-xs text-slate-500">
                      {minStock} {item.unidade}
                    </TableCell>

                    <TableCell className="text-right text-xs">
                      {est.quantidadeEmprestada > 0 ? (
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {est.quantidadeEmprestada} {item.unidade}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant={status.variant} className="text-[10px]">
                        {status.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                        <Eye className="w-3.5 h-3.5 mr-1" /> Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
