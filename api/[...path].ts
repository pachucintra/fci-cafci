export const config = { runtime: 'edge' }

const CAFCI_HEADERS = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'es-AR,es;q=0.9',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Referer': 'https://www.cafci.org.ar/',
  'Origin': 'https://www.cafci.org.ar',
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const apiPath = url.pathname.replace(/^\/api/, '')

  let targetUrl: string
  let reqHeaders: Record<string, string>

  if (apiPath.startsWith('/argentinadatos/')) {
    const adPath = apiPath.replace(/^\/argentinadatos/, '')
    targetUrl = `https://api.argentinadatos.com${adPath}${url.search}`
    reqHeaders = { 'Accept': 'application/json' }
  } else {
    targetUrl = `https://api.cafci.org.ar${apiPath}${url.search}`
    reqHeaders = CAFCI_HEADERS
  }

  try {
    const response = await fetch(targetUrl, { headers: reqHeaders })
    const body = await response.text()
    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
