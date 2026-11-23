export default {
  fetch(request) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.hostname = 'anashoussaini.com';
    url.port = '';
    return Response.redirect(url.toString(), 301);
  },
};
