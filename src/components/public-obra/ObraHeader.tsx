'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Building2,
  MapPin,
  User,
  Phone,
  Calendar,
  QrCode,
  Radio,
  Share2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { formatDate } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface ObraHeaderProps {
  obra: any
  isConnected: boolean
  lastEventTime: Date | null
}

export function ObraHeader({ obra, isConnected, lastEventTime }: ObraHeaderProps) {
  const [copied, setCopied] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)

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
          <Badge variant="success" className="text-xs px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
            Obra em Andamento
          </Badge>
        )
      case 'planejamento':
        return (
          <Badge variant="info" className="text-xs px-2.5 py-1">
            <Clock className="w-3 h-3 mr-1" />
            Em Planejamento
          </Badge>
        )
      case 'pausada':
        return (
          <Badge variant="warning" className="text-xs px-2.5 py-1">
            <AlertCircle className="w-3 h-3 mr-1" />
            Obra Pausada
          </Badge>
        )
      case 'concluida':
        return (
          <Badge variant="secondary" className="text-xs px-2.5 py-1">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Obra Concluída
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const enderecoTexto = obra?.endereco
    ? [
        obra.endereco.logradouro && `${obra.endereco.logradouro}, ${obra.endereco.numero || 'S/N'}`,
        obra.endereco.bairro,
        obra.endereco.cidade && `${obra.endereco.cidade} - ${obra.endereco.estado || ''}`,
      ]
        .filter(Boolean)
        .join(' • ')
    : 'Localização não cadastrada'

  const currentUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://estoqueobra.com/obras/${obra?.slug}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(currentUrl)}`

  return (
    <header className="relative bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Informações Principais da Obra */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {obra.codigo || 'OBRA'}
              </span>
              {getStatusBadge(obra.status)}

              {/* Status de Conexão em Tempo Real */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse-subtle' : 'bg-amber-400'
                  }`}
                />
                <span className="text-slate-600 dark:text-slate-300">
                  {isConnected ? 'Ao Vivo (SSE)' : 'Reconectando...'}
                </span>
                {lastEventTime && (
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    • Atualizado às {lastEventTime.toLocaleTimeString('pt-BR')}
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
              <Building2 className="w-7 h-7 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{obra.nome}</span>
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate" title={enderecoTexto}>
                  {enderecoTexto}
                </span>
              </div>

              {obra.responsavel && (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">
                    <strong>Resp:</strong> {obra.responsavel}
                  </span>
                </div>
              )}

              {obra.contatoResponsavel && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{obra.contatoResponsavel}</span>
                </div>
              )}

              {(obra.dataInicio || obra.previsaoTermino) && (
                <div className="flex items-center gap-1.5 sm:col-span-2 lg:col-span-3 text-slate-500">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Início: <strong>{formatDate(obra.dataInicio, 'dd/MM/yyyy')}</strong>
                    {obra.previsaoTermino && (
                      <>
                        {' '}
                        • Previsão Conclusão:{' '}
                        <strong>{formatDate(obra.previsaoTermino, 'dd/MM/yyyy')}</strong>
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Botões de Ação e Compartilhamento */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <Button variant="outline" size="sm" onClick={() => setQrOpen(true)} className="gap-1.5">
              <QrCode className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span>QR Code da Obra</span>
            </Button>

            <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
              <Share2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span>{copied ? 'Link Copiado!' : 'Compartilhar'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Modal QR Code */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              QR Code do Almoxarifado
            </DialogTitle>
            <DialogDescription className="text-center">
              Imprima e fixe na porta do almoxarifado para que os encarregados acessem o estoque
              pelo celular.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 my-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt={`QR Code para ${obra.nome}`}
              className="w-56 h-56 rounded-lg shadow-xs bg-white p-2"
            />
            <p className="mt-3 font-semibold text-xs text-slate-700 dark:text-slate-200">
              {obra.nome} ({obra.codigo})
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setQrOpen(false)}>
              Fechar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (typeof window !== 'undefined') window.print()
              }}
            >
              Imprimir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
