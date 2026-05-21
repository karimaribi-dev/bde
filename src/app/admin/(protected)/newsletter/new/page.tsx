import NewsletterEditor from '@/components/NewsletterEditor'

export const dynamic = 'force-dynamic'

export default function NewNewsletterPage() {
  return (
    <>
      <header className="admin-header">
        <h1>Nouvelle newsletter</h1>
      </header>
      <NewsletterEditor />
    </>
  )
}
