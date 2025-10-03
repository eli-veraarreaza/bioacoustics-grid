export async function handler(event) {
  const url = event.queryStringParameters?.url || "";
  if (!url) return { statusCode: 400, body: "Missing url param" };

  try {
    const u = new URL(url);
    // Seguridad básica: solo xeno-canto
    if (!u.host.includes('xeno-canto.org')) {
      return { statusCode: 400, body: "Invalid host" };
    }

    const resp = await fetch(url, { redirect: 'follow' });
    if (!resp.ok) return { statusCode: resp.status, body: "Upstream error" };

    const buf = await resp.arrayBuffer();
    const type = resp.headers.get('content-type') || 'audio/mpeg';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': type,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400'
      },
      body: Buffer.from(buf).toString('base64'),
      isBase64Encoded: true
    };
  } catch (e) {
    return { statusCode: 500, body: 'Proxy error: ' + e.message };
  }
}
