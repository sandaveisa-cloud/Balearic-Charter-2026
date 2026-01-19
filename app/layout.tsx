// This is a minimal root layout that will be overridden by [locale]/layout.tsx
// It's required by Next.js but won't be used for locale-based routing
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
