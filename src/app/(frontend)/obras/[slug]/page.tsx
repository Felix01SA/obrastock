import React from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { ObraViewClient } from '@/components/public-obra/ObraViewClient'

export const dynamic = 'force-dynamic'

interface ObraPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ObraPageProps) {
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
        title: 'Obra não encontrada - ObraStock',
      }
    }

    return {
      title: `${obra.nome} | Estoque & Almoxarifado em Tempo Real`,
      description: `Acompanhe o estoque de materiais, insumos e ferramentas no canteiro de obras ${obra.nome} (${obra.codigo}).`,
    }
  } catch {
    return {
      title: 'ObraStock - Almoxarifado de Obras',
    }
  }
}

export default async function ObraPublicPage({ params }: ObraPageProps) {
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
    limit: 200,
  })

  // 3. Buscar movimentações recentes da obra
  const movimentacoesResult = await payload.find({
    collection: 'movimentacoes',
    where: { obra: { equals: obra.id } },
    depth: 2,
    sort: '-dataHora',
    limit: 50,
  })

  // 4. Buscar categorias
  const categoriasResult = await payload.find({
    collection: 'categorias',
    limit: 50,
  })

  return (
    <ObraViewClient
      obra={obra}
      initialEstoques={estoqueResult.docs}
      initialMovimentacoes={movimentacoesResult.docs}
      categorias={categoriasResult.docs}
    />
  )
}
