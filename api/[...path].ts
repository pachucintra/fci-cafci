export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const cafciPath = url.pathname.replace(/^\/api/, '')
  const targetUrl = `https://api.cafci.org.ar${cafciPath}${url.search}`

  try {
    const response = await fetch(targetUrl, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
    })
    const body = await response.text()
    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Proxy error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
