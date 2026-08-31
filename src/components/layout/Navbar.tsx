'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Boxes,
  Building2,
  Sliders,
  Database,
  Sparkles,
  ExternalLink,
  Menu,
  X,
  Radio,
} from 'lucide-react'

export function Navbar() {
  const [seeding, setSeeding] = useState(false)
  const [seedStatus, setSeedStatus] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSeed = async () => {
    try {
      setSeeding(true)
      setSeedStatus('Carregando dados de exemplo...')
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setSeedStatus('✅ Dados carregados com sucesso!')
        setTimeout(() => {
          setSeedStatus(null)
          window.location.reload()
        }, 1500)
      } else {
        setSeedStatus('❌ Erro ao popular dados.')
        setTimeout(() => setSeedStatus(null), 3000)
      }
    } catch (e) {
      setSeedStatus('❌ Erro na requisição de seed.')
      setTimeout(() => setSeedStatus(null), 3000)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Marca */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-slate-100 hover:opacity-90 transition-opacity"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white shadow-xs">
                <Boxes className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-heading font-extrabold tracking-tight leading-none">
                  ObraStock
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                  Almoxarifado & Estoque
                </span>
              </div>
            </Link>

            {/* Links de Navegação Desktop */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                href="/"
                className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Obras e Canteiros</span>
              </Link>
            </nav>
          </div>

          {/* Ações / Admin */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Link para Painel Payload Admin */}
            <Link href="/admin" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gap-1.5 text-xs shadow-xs">
                <Sliders className="w-3.5 h-3.5" />
                <span>Painel Admin</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </Button>
            </Link>
          </div>

          {/* Botão Menu Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Notificação flutuante de status de seed */}
        {seedStatus && (
          <div className="p-2 text-center text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-t border-blue-200 dark:border-blue-800 animate-pulse">
            {seedStatus}
          </div>
        )}
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium"
          >
            <Building2 className="w-4 h-4 text-slate-400" />
            Obras e Canteiros
          </Link>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeed}
              disabled={seeding}
              className="w-full justify-center gap-1.5 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{seeding ? 'Populando...' : 'Carregar Dados Demo'}</span>
            </Button>

            <Link href="/admin" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="w-full justify-center gap-1.5 text-xs">
                <Sliders className="w-3.5 h-3.5" />
                <span>Painel Admin</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
