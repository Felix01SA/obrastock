import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Package,
  MapPin,
  User,
  ArrowRight,
  Sparkles,
  Sliders,
  Radio,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let obras: any[] = []
  let totalItens = 0
  let totalMovs = 0

  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const obrasResult = await payload.find({
      collection: 'obras',
      where: {
        publicaAtiva: { equals: true },
      },
      limit: 50,
    })
    obras = obrasResult.docs

    const totalItensResult = await payload.find({
      collection: 'itens',
      limit: 1,
    })
    totalItens = totalItensResult.totalDocs

    const totalMovsResult = await payload.find({
      collection: 'movimentacoes',
      limit: 1,
    })
    totalMovs = totalMovsResult.totalDocs
  } catch (error) {
    console.warn('Banco de dados ainda não inicializado ou tabelas pendentes:', error)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return (
          <Badge variant="default" className="text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
            Em Andamento
          </Badge>
        )
      case 'planejamento':
        return (
          <Badge variant="default" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Planejamento
          </Badge>
        )
      case 'pausada':
        return (
          <Badge variant="default" className="text-xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pausada
          </Badge>
        )
      case 'concluida':
        return (
          <Badge variant="secondary" className="text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Concluída
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-700 via-emerald-800 to-slate-900 text-white p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 backdrop-blur-md text-xs font-semibold border border-white/15">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Sincronização em Tempo Real via SSE & Payload CMS 3.0
          </div>

          <h1 className="text-3xl font-heading sm:text-5xl font-black tracking-tight leading-tight">
            Controle de Estoque & Almoxarifado de Obras
          </h1>

          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Gestão integrada de materiais, insumos consumíveis, ferramentas duráveis e EPIs.
            Acompanhe o saldo e movimentações de cada canteiro de obras ao vivo em páginas públicas
            dedicadas com Shadcn UI & Base UI.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/admin" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-white text-blue-900 hover:bg-blue-50 font-bold gap-2 shadow-md"
              >
                <Sliders className="w-4 h-4 text-blue-600" />
                Acessar Painel do Almoxarifado
              </Button>
            </Link>

            <Link href="/api/seed" target="_blank">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 gap-2 backdrop-blur-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Carregar Dados de Demonstração
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none flex items-center justify-center">
          <Building2 className="w-96 h-96 -rotate-12 translate-x-20" />
        </div>
      </div>

      {/* Métricas Globais do Sistema */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Canteiros de Obras Ativos
              </p>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {obras.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Building2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Itens Cadastrados no Catálogo
              </p>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {totalItens}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Package className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Movimentações Registradas
              </p>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {totalMovs}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Canteiros de Obras */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Canteiros de Obras Cadastrados
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Selecione uma obra para visualizar o estoque de materiais e ferramentas em tempo real.
            </p>
          </div>
        </div>

        {obras.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
            <Building2 className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Nenhuma obra cadastrada ainda
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Você pode carregar dados de teste instantaneamente ou acessar o painel administrativo
              do Payload para cadastrar sua primeira obra.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/api/seed" target="_blank">
                <Button className="gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Carregar Dados de Demonstração
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline">Ir para o Admin</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {obras.map((obra: any) => {
              const fotoUrl =
                obra.fotoUrl || (typeof obra.foto === 'object' && obra.foto?.url) || null
              const enderecoFormatado = obra?.endereco
                ? [
                    obra.endereco.bairro,
                    obra.endereco.cidade && `${obra.endereco.cidade}-${obra.endereco.estado || ''}`,
                  ]
                    .filter(Boolean)
                    .join(' • ')
                : 'Localização'

              return (
                <Card
                  key={obra.id}
                  className="group overflow-hidden pt-0 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                >
                  {/* Foto de Capa da Obra */}
                  <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {fotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fotoUrl}
                        alt={obra.nome}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Building2 className="w-12 h-12 opacity-40" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-black/75 text-white backdrop-blur-xs">
                        {obra.codigo}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">{getStatusBadge(obra.status)}</div>
                  </div>

                  <CardHeader className="p-5 pb-2">
                    <CardTitle className="text-xl font-bold front-heading group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {obra.nome}
                    </CardTitle>
                    {obra.descricao && (
                      <CardDescription className="line-clamp-2 text-xs mt-1">
                        {obra.descricao}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{enderecoFormatado}</span>
                    </div>

                    {obra.responsavel && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">
                          <strong>Resp:</strong> {obra.responsavel}
                        </span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-5 pt-0">
                    <Link href={`/obras/${obra.slug}`} className="w-full">
                      <Button className="w-full justify-between gap-2 shadow-xs group-hover:bg-emerald-700">
                        <span>Ver Almoxarifado em Tempo Real</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
