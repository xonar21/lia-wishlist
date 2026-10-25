// Старый адрес lia-wishlist.pages.dev → forlia.pages.dev с тем же путём и параметрами (?bg=… и т. п.).
// Выкладывается в старый проект отдельно от сайта:
//   npx wrangler pages deploy old-url-redirect --project-name lia-wishlist --branch main
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.hostname = 'forlia.pages.dev';
    return Response.redirect(url.toString(), 301);
  }
};
