'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ObraHeader } from './ObraHeader'
import { ObraKpiCards } from './ObraKpiCards'
import { ObraStockSection } from './ObraStockSection'
import { ObraMovementsTimeline } from './ObraMovementsTimeline'
import { ItemDetailDialog } from './ItemDetailDialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Package,
  Activity,
  Info,
  Building2,
  MapPin,
  User,
  Calendar,
  Phone,
  Mail,
} from 'lucide-react'
import { formatDate } from 'date-fns'

interface ObraViewClientProps {
  obra: any
  initialEstoques: any[]
  initialMovimentacoes: any[]
  categorias: any[]
}

export function ObraViewClient({
  obra,
  initialEstoques,
  initialMovimentacoes,
  categorias,
}: ObraViewClientProps) {
  const [estoques, setEstoques] = useState<any[]>(initialEstoques || [])
  const [movimentacoes, setMovimentacoes] = useState<any[]>(initialMovimentacoes || [])
  const [isConnected, setIsConnected] = useState(false)
  const [lastEventTime, setLastEventTime] = useState<Date | null>(null)
  const [selectedStockItem, setSelectedStockItem] = useState<any | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Sincronização via Server-Sent Events (SSE) em tempo real
  const handleRealtimeEvent = useCallback((eventData: any) => {
    setLastEventTime(new Date())

    if (eventData.type === 'connected') {
      setIsConnected(true)
      return
    }

    if (eventData.type === 'movement_created' && eventData.payload) {
      const newMovement = eventData.payload
      setMovimentacoes((prev) => {
        // Evitar duplicados
        const exists = prev.some((m) => m.id === newMovement.id)
        if (exists) return prev
        return [newMovement, ...prev]
      })
    }

    if (eventData.type === 'stock_update' && eventData.payload) {
      const { itemId, quantidade, quantidadeEmprestada } = eventData.payload
      setEstoques((prev) =>
        prev.map((est) => {
          const currentItemId = typeof est.item === 'object' ? est.item?.id : est.item
          if (currentItemId === itemId) {
            return {
              ...est,
              quantidade,
              quantidadeEmprestada,
              ultimaMovimentacao: new Date().toISOString(),
            }
          }
          return est
        }),
      )
    }
  }, [])

  useEffect(() => {
    if (!obra?.slug) return

    let eventSource: EventSource | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null

    const connectSSE = () => {
      try {
        eventSource = new EventSource(`/api/realtime/obra/${obra.slug}`)

        eventSource.onopen = () => {
          setIsConnected(true)
        }

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            handleRealtimeEvent(data)
          } catch (e) {
            // Ping ou heartbeat
          }
        }

        eventSource.onerror = () => {
          setIsConnected(false)
          eventSource?.close()
          // Tentar reconectar em 5 segundos
          reconnectTimeout = setTimeout(connectSSE, 5000)
        }
      } catch (err) {
        setIsConnected(false)
      }
    }

    connectSSE()

    return () => {
      if (eventSource) eventSource.close()
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
    }
  }, [obra?.slug, handleRealtimeEvent])

  const handleSelectItem = (stockItem: any) => {
    setSelectedStockItem(stockItem)
    setDetailDialogOpen(true)
  }

  // Filtrar movimentações para o item selecionado
  const selectedItemMovements = React.useMemo(() => {
    if (!selectedStockItem) return []
    const itemId =
      typeof selectedStockItem.item === 'object'
        ? selectedStockItem.item?.id
        : selectedStockItem.item
    return movimentacoes.filter((m) => {
      const movItemId = typeof m.item === 'object' ? m.item?.id : m.item
      return movItemId === itemId
    })
  }, [selectedStockItem, movimentacoes])

  return (
    <div className="min-h-screen pb-16">
      {/* Header Superior da Obra com SSE Live Indicator */}
      <ObraHeader obra={obra} isConnected={isConnected} lastEventTime={lastEventTime} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Métricas Principais (KPIs) */}
        <ObraKpiCards estoques={estoques} movimentacoes={movimentacoes} />

        {/* Abas de Navegação Principal da Obra */}
        <Tabs defaultValue="estoque" className="w-full space-y-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 max-w-md">
            <TabsTrigger value="estoque" className="gap-1.5 text-xs sm:text-sm">
              <Package className="w-4 h-4" />
              <span>Estoque</span>
            </TabsTrigger>
            <TabsTrigger value="movimentacoes" className="gap-1.5 text-xs sm:text-sm">
              <Activity className="w-4 h-4" />
              <span>Ao Vivo</span>
              {movimentacoes.length > 0 && (
                <span className="hidden sm:inline-block ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700">
                  {movimentacoes.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="detalhes" className="gap-1.5 text-xs sm:text-sm">
              <Info className="w-4 h-4" />
              <span>Sobre</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba: Catálogo de Estoque */}
          <TabsContent value="estoque" className="space-y-6">
            <ObraStockSection
              estoques={estoques}
              categorias={categorias}
              onSelectItem={handleSelectItem}
            />
          </TabsContent>

          {/* Aba: Movimentações em Tempo Real */}
          <TabsContent value="movimentacoes" className="space-y-6">
            <ObraMovementsTimeline movimentacoes={movimentacoes} />
          </TabsContent>

          {/* Aba: Detalhes da Obra */}
          <TabsContent value="detalhes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Informações Técnicas do Canteiro de Obras
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {obra.descricao && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Descrição do Projeto
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      {obra.descricao}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border space-y-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-400" /> Responsável Técnico
                    </span>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {obra.responsavel}
                    </p>
                  </div>

                  {obra.contatoResponsavel && (
                    <div className="p-4 rounded-xl border space-y-1">
                      <span className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-slate-400" /> Contato Direto
                      </span>
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {obra.contatoResponsavel}
                      </p>
                    </div>
                  )}

                  {obra.emailContato && (
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-slate-400" /> E-mail do Canteiro
                      </span>
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {obra.emailContato}
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" /> Cronograma
                    </span>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Início: {formatDate(obra.dataInicio, 'dd/MM/yyyy')}
                    </p>
                    {obra.previsaoTermino && (
                      <p className="text-xs text-slate-500">
                        Término previsto: {formatDate(obra.previsaoTermino, 'dd/MM/yyyy')}
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 sm:col-span-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" /> Endereço Completo
                    </span>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {obra?.endereco?.logradouro} {obra?.endereco?.numero}
                    </p>
                    <p className="text-xs text-slate-500">
                      {obra?.endereco?.bairro} • {obra?.endereco?.cidade} - {obra?.endereco?.estado}{' '}
                      • CEP {obra?.endereco?.cep}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de Detalhes do Item */}
      <ItemDetailDialog
        stockItem={selectedStockItem}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        itemMovements={selectedItemMovements}
        exibirValores={obra?.exibirValores}
      />
    </div>
  )
}
