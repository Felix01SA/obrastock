import React from 'react'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import './styles.css'
import { cn } from '@/lib/utils'
import { Outfit, Inter } from 'next/font/google'

export const metadata: Metadata = {
  title: 'ObraStock - Controle de Estoque & Almoxarifado em Tempo Real',
  description:
    'Sistema inteligente de gestão de materiais, insumos, ferramentas e estoque por canteiro de obras com atualização em tempo real.',
}

const outfit = Outfit({
  variable: '--font-heading',
  subsets: ['latin'],
})

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        className={cn(
          outfit.variable,
          inter.variable,
          'min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased flex flex-col justify-between font-sans',
        )}
      >
        <div>
          <Navbar />
          {children}
        </div>

        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 font-sans">
          <div className="max-w-7xl mx-auto px-4">
            <p>
              <strong className="font-heading">ObraStock</strong> • Sistema de Controle de
              Almoxarifado e Estoque de Obras Civis
            </p>
            <p className="mt-1 text-slate-400">Desenvolvido por Felix01SA</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
