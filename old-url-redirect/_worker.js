// Адреса на Cloudflare (lia-wishlist.pages.dev, forlia.pages.dev) → сайт в Yandex Cloud с тем же путём
// и параметрами (?bg=… и т. п.). Ответ-перенаправление крошечный, поэтому проходит и при замедлении
// Cloudflare в России. Выкладывается в оба проекта отдельно от сайта:
//   npx wrangler pages deploy old-url-redirect --project-name lia-wishlist --branch main
//   npx wrangler pages deploy old-url-redirect --project-name forlia --branch main
// Вернуть сайт на Cloudflare: npx wrangler pages deploy dist --project-name forlia --branch main
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.hostname = 'forlia.website.yandexcloud.net';
    url.port = '';
    return Response.redirect(url.toString(), 301);
  }
};
