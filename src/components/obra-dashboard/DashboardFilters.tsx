'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Filter,
  X,
  Calendar,
  Layers,
  HardHat,
  RotateCcw,
} from 'lucide-react'

export type PeriodoPreset = '7d' | '30d' | '90d' | 'mes_atual' | 'tudo'

interface DashboardFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCategoria: string
  onCategoriaChange: (value: string) => void
  categorias: any[]
  selectedPeriodo: PeriodoPreset
  onPeriodoChange: (periodo: PeriodoPreset) => void
  selectedFrente: string
  onFrenteChange: (frente: string) => void
  frentesDisponiveis: string[]
  onReset: () => void
  hasActiveFilters: boolean
}

export function DashboardFilters({
  searchTerm,
  onSearchChange,
  selectedCategoria,
  onCategoriaChange,
  categorias,
  selectedPeriodo,
  onPeriodoChange,
  selectedFrente,
  onFrenteChange,
  frentesDisponiveis,
  onReset,
  hasActiveFilters,
}: DashboardFiltersProps) {
  const periodos: Array<{ id: PeriodoPreset; label: string }> = [
    { id: '7d', label: '7 Dias' },
    { id: '30d', label: '30 Dias' },
    { id: '90d', label: '90 Dias' },
    { id: 'mes_atual', label: 'Este Mês' },
    { id: 'tudo', label: 'Todo o Histórico' },
  ]

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3.5">
      {/* Linha 1: Períodos rápidos e busca por material */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Seletor de Período (Pills / Botões Rápidos) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            Período:
          </span>
          {periodos.map((p) => {
            const isActive = selectedPeriodo === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPeriodoChange(p.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            )
          })}
        </div>

        {/* Input de Busca por Material */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Filtrar por nome ou código..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs bg-slate-50 dark:bg-slate-800/50"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Linha 2: Filtros secundários (Categoria, Frente de Serviço e Reset) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor Categoria */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="text-slate-500 font-medium">Categoria:</span>
            <select
              value={selectedCategoria}
              onChange={(e) => onCategoriaChange(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="todas">Todas as Categorias</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Seletor Frente de Serviço */}
          {frentesDisponiveis.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <HardHat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-slate-500 font-medium">Frente:</span>
              <select
                value={selectedFrente}
                onChange={(e) => onFrenteChange(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1 max-w-[150px] truncate"
              >
                <option value="todas">Todas as Frentes</option>
                {frentesDisponiveis.map((frente) => (
                  <option key={frente} value={frente}>
                    {frente}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Botão Reset de Filtros */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1 ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpar Filtros</span>
          </Button>
        )}
      </div>
    </div>
  )
}
