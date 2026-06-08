export function onRequest(context) {
  return Response.redirect(new URL("/", context.request.url).toString(), 302);
}
