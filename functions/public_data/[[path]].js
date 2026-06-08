const DATA_PREFIX = "qagro_demo/public_data/";

const CONTENT_TYPES = {
  ".json": "application/json; charset=utf-8",
  ".jsonl": "application/x-ndjson; charset=utf-8"
};

function normalizePath(value) {
  const raw = Array.isArray(value) ? value.join("/") : String(value || "");
  const clean = raw.replace(/^\/+/, "");
  if (!clean || clean.includes("..") || clean.includes("\\")) return null;
  return clean;
}

function contentType(path) {
  const ext = path.match(/\.[^.]+$/);
  return ext && CONTENT_TYPES[ext[0]] ? CONTENT_TYPES[ext[0]] : "application/octet-stream";
}

export async function onRequest(context) {
  const path = normalizePath(context.params.path);
  if (!path) return new Response("Not found", { status: 404 });
  if (context.request.method !== "GET" && context.request.method !== "HEAD") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD" }
    });
  }

  const object = await context.env.QAGRO_DATA.get(DATA_PREFIX + path);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  headers.set("Content-Type", object.httpMetadata?.contentType || contentType(path));
  headers.set("Cache-Control", "public, max-age=300");
  headers.set("ETag", object.httpEtag);
  if (object.size != null) headers.set("Content-Length", String(object.size));

  return new Response(context.request.method === "HEAD" ? null : object.body, { headers });
}
