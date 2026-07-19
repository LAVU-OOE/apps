// worker.js – LAVU Apps API with CORS and KV storage
// Deploy with: wrangler deploy

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

export default {
  async fetch(request, env, ctx) {
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Ensure KV binding exists
    if (!env.APPS_DATA) {
      return errorResponse('KV binding "APPS_DATA" missing', 500);
    }

    try {
      // GET – fetch all apps
      if (request.method === 'GET') {
        const raw = await env.APPS_DATA.get('apps_list');
        const apps = raw ? JSON.parse(raw) : [];
        return jsonResponse(apps);
      }

      // POST – add new app
      if (request.method === 'POST') {
        const newApp = await request.json();
        if (!newApp.url) return errorResponse('URL is required');
        if (!newApp.nameDe && !newApp.nameEn && !newApp.name) {
          return errorResponse('Name (DE, EN, or generic) is required');
        }
        const raw = await env.APPS_DATA.get('apps_list');
        const apps = raw ? JSON.parse(raw) : [];
        apps.push(newApp);
        await env.APPS_DATA.put('apps_list', JSON.stringify(apps));
        return jsonResponse({ added: newApp }, 201);
      }

      // PUT – update app by index
      if (request.method === 'PUT') {
        const { index, app } = await request.json();
        if (index === undefined || index === null) return errorResponse('Index required');
        if (!app) return errorResponse('App data required');
        const raw = await env.APPS_DATA.get('apps_list');
        const apps = raw ? JSON.parse(raw) : [];
        if (index < 0 || index >= apps.length) return errorResponse('Invalid index');
        apps[index] = app;
        await env.APPS_DATA.put('apps_list', JSON.stringify(apps));
        return jsonResponse({ updated: app });
      }

      // DELETE – remove app by index
      if (request.method === 'DELETE') {
        const { index } = await request.json();
        if (index === undefined || index === null) return errorResponse('Index required');
        const raw = await env.APPS_DATA.get('apps_list');
        const apps = raw ? JSON.parse(raw) : [];
        if (index < 0 || index >= apps.length) return errorResponse('Invalid index');
        apps.splice(index, 1);
        await env.APPS_DATA.put('apps_list', JSON.stringify(apps));
        return jsonResponse({ deleted: true });
      }

      return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS });
    } catch (err) {
      console.error('Worker error:', err);
      return errorResponse('Internal server error: ' + err.message, 500);
    }
  },
};