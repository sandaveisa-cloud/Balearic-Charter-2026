import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/routing'
import TermsAndConditions from '@/components/TermsAndConditions'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'terms' })
  
  return {
    title: t('title'),
    description: t('metaDescription'),
  }
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params

  if (!locale || !locales.includes(locale as any)) {
    notFound()
  }

  return <TermsAndConditions />
}
