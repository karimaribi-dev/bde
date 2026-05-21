import type { Article } from './types'

interface TemplateOptions {
  subject: string
  editorial: string
  articles: Article[]
  unsubscribeUrl: string
  siteUrl: string
}

export function buildNewsletterHtml({ editorial, articles, unsubscribeUrl, siteUrl }: TemplateOptions): string {
  const articlesHtml = articles.map((article) => {
    const url = `${siteUrl}/articles/${article.slug}`
    const imageBlock = article.cover_image_url
      ? `<img src="${article.cover_image_url}" alt="${article.cover_image_alt ?? article.title}" width="560" style="width:100%;max-width:560px;height:180px;object-fit:cover;display:block;border:0;" />`
      : ''
    return `
      <tr>
        <td style="padding:0 0 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:0 0 2px 0;">
                <span style="font-family:Courier New,Courier,monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#888;">${article.category?.name ?? ''}</span>
              </td>
            </tr>
            ${imageBlock ? `<tr><td style="padding:10px 0;">${imageBlock}</td></tr>` : ''}
            <tr>
              <td style="padding:8px 0 0 0;">
                <a href="${url}" style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#0c0c0c;text-decoration:none;line-height:1.2;display:block;">${article.title}</a>
              </td>
            </tr>
            ${article.excerpt ? `
            <tr>
              <td style="padding:8px 0 0 0;">
                <p style="margin:0;font-family:Georgia,serif;font-size:14px;color:#555;line-height:1.55;">${article.excerpt}</p>
              </td>
            </tr>` : ''}
            <tr>
              <td style="padding:12px 0 0 0;">
                <a href="${url}" style="font-family:Courier New,Courier,monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#0c0c0c;text-decoration:underline;">Lire la suite →</a>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 0 0 0;border-bottom:1px solid #e5e5e5;"></td>
            </tr>
          </table>
        </td>
      </tr>
    `
  }).join('')

  const editorialHtml = editorial
    ? `
      <tr>
        <td style="padding:0 0 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:0 0 12px 0;border-bottom:1px solid #0c0c0c;">
                <span style="font-family:Courier New,Courier,monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#888;">Éditorial</span>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 0 0 0;font-family:Georgia,serif;font-size:15px;line-height:1.65;color:#0c0c0c;">
                ${editorial}
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Trends News</title>
</head>
<body style="margin:0;padding:0;background:#f3efe6;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3efe6;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:0 0 40px 0;border-bottom:2px solid #0c0c0c;text-align:center;">
              <a href="${siteUrl}" style="text-decoration:none;">
                <span style="font-family:Courier New,Courier,monospace;font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:#888;display:block;margin-bottom:6px;">Veille IA quotidienne</span>
                <span style="font-family:Georgia,serif;font-size:32px;font-weight:700;color:#0c0c0c;letter-spacing:-.02em;">AI TRENDS NEWS</span>
              </a>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 0 0 0;background:#f3efe6;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${editorialHtml}
                ${articlesHtml}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:40px 0 0 0;border-top:1px solid #ccc;text-align:center;">
              <p style="margin:0 0 8px 0;font-family:Courier New,Courier,monospace;font-size:11px;color:#888;letter-spacing:.1em;">AI TRENDS NEWS · ${siteUrl}</p>
              <p style="margin:0;font-family:Courier New,Courier,monospace;font-size:10px;color:#aaa;">
                <a href="${unsubscribeUrl}" style="color:#aaa;text-decoration:underline;">Se désabonner</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
