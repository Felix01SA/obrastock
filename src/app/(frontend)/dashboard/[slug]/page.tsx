import React from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { ObraDashboardClient } from '@/components/obra-dashboard/ObraDashboardClient'

export const dynamic = 'force-dynamic'

interface DashboardSlugPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: DashboardSlugPageProps) {
  const { slug } = await params
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const result = await payload.find({
      collection: 'obras',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    const obra = result.docs[0]
    if (!obra) {
      return {
        title: 'Dashboard não encontrada - ObraStock',
      }
    }

    return {
      title: `Dashboard de Consumo | ${obra.nome} (${obra.codigo})`,
      description: `Painel analítico, gráficos de consumo semanal, mensal e histórico de materiais da obra ${obra.nome}.`,
    }
  } catch {
    return {
      title: 'Dashboard de Consumo de Materiais - ObraStock',
    }
  }
}

export default async function DashboardSlugPage({ params }: DashboardSlugPageProps) {
  const { slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // 1. Buscar a obra
  const obraResult = await payload.find({
    collection: 'obras',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const obra = obraResult.docs[0]

  if (!obra || obra.publicaAtiva === false) {
    notFound()
  }

  // 2. Buscar estoque da obra
  const estoqueResult = await payload.find({
    collection: 'estoque-obra',
    where: { obra: { equals: obra.id } },
    depth: 2,
    limit: 500,
  })

  // 3. Buscar todas as movimentações da obra para gerar os gráficos
  const movimentacoesResult = await payload.find({
    collection: 'movimentacoes',
    where: { obra: { equals: obra.id } },
    depth: 2,
    sort: '-dataHora',
    limit: 500,
  })

  // 4. Buscar categorias
  const categoriasResult = await payload.find({
    collection: 'categorias',
    limit: 100,
  })

  return (
    <ObraDashboardClient
      obra={obra}
      initialEstoques={estoqueResult.docs}
      initialMovimentacoes={movimentacoesResult.docs}
      categorias={categoriasResult.docs}
    />
  )
}
