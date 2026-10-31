// id — ключ брони в базе, менять нельзя; n — номер на сайте. link — ссылка на товар, photo — фото (tools/gift-photos.py),
// note — практическая приписка под описанием (цена с картой, доставка и т. п.).
// img: [x, y] — левый верхний угол фото в единицах макета (1440px); размер фото у всех один (--is в styles.css).
// text — где текст на десктопе: right/left — сбоку от фото, по его верху (top) или низу (bottom);
// below — под фото, по центру (center) или по правому краю (end). tw — ширина текста, dw — ширина описания.
// row — общий ряд: кнопки в нём стоят на одной линии.
const gifts = [
  {id:0, n:'01', name:'сертификат в фотостудию', desc:'хочу нарядиться, устроить фотосессию перед зеркалом.\nбез фотографа, чужих советов и необходимости объяснять, почему я делаю уже сороковой кадр — в целом, как дома, но более профессионально', price:'3 650 ₽', link:'https://gift.povodphoto.ru/', photo:'assets/gifts/photostudio.webp', img:[199.1,3709.1], text:'right bottom', tw:454},
  {id:5, n:'02', name:'сертификат мк “та самая кружка”', desc:'хочу попробовать сделать что-то красивое и несовершенное своими руками.\nчто-то свое, что-то обо мне', price:'3 500 ₽', link:'https://artistastudio.ru/ceramista/podari', photo:'assets/gifts/ceramics.webp', img:[974.6,3869.2], text:'below end', tw:454, dw:256},
  {id:13, n:'03', name:'ирригатор', desc:'вклад в “мне тоже нравятся мои зубки”', price:'4 000 ₽', link:'https://clck.ru/3Wgb2P', photo:'assets/gifts/irrigator.webp', img:[419.1,4354.3], text:'below center', tw:325, dw:256},
  {id:6, n:'04', name:'компьютерная мышка', desc:'новая РЕТРО мышка для работы, дизайна и всяких творческих дел. классная же?', price:'1 400 ₽', link:'https://clck.ru/3WgbAS', photo:'assets/gifts/mouse.webp', img:[930.9,4812.4], text:'below end', tw:454, dw:256},
  {id:12, n:'05', name:'картина по номерам', desc:'хочу раскрашивать красоту и потом созерцать. мозгу тоже нужен отпуск от бесконечных экзистенциальных вопросов.', price:'1 450 ₽', link:'https://clck.ru/3Wgcab', photo:'assets/gifts/painting-1.webp', img:[364.1,5420.8], text:'left top', tw:298, dw:256},
  {id:1, n:'05.1', name:'картина по номерам (2)', desc:'на манеже все те же', price:'1 050 ₽', link:'https://clck.ru/3Wgcar', photo:'assets/gifts/painting-2.webp', img:[616.1,5420.8], text:'right bottom', tw:454},
  {id:18, n:'05.2', name:'картина по номерам (3)', desc:'на манеже все те же', price:'700 ₽', link:'https://www.wildberries.ru/catalog/1118879819/detail.aspx', photo:'assets/gifts/painting-3.webp', img:[616.1,5692.1], text:'below center', tw:325, dw:256},
  {id:20, n:'06', name:'капор', desc:'тёплый вязаный капор — чтобы питерский ветер не добирался до ушей', note:'цена — с картой ozon', price:'2 400 ₽', link:'https://clck.ru/3Wgcvu', photo:'assets/gifts/kapor.webp', img:[1063.8,6241.8], text:'left top', tw:454, dw:256},
  {id:7, n:'07', name:'рукавички', desc:'тёплые и уютные, чтобы гулять по моему питеру и не мёрзнуть.', price:'700 ₽', link:'https://clck.ru/3Wgd27', photo:'assets/gifts/mittens.webp', img:[1063.8,6562.1], text:'left top', tw:454, dw:256},
  {id:2, n:'08', name:'проектор', desc:'чтобы устраивать домашние кинопоказы, смотреть фильмы на потолке во время свидания и делать вид, что у меня собственный маленький кинотеатр', note:'цена — с картой ozon', price:'6 300 ₽', link:'https://clck.ru/3WgbyN', photo:'assets/gifts/projector.webp', img:[516.9,6822.2], text:'right bottom', tw:454},
  {id:8, n:'09', name:'мерч по гарри поттеру', desc:'а как же без этого? подарите что-то из вариантов, чтобы они выдавали во мне человека, который все еще ждет письмо из хогвартса', note:'шоппер, доставка — около 600 ₽', price:'1 200 ₽', link:'https://clck.ru/3WhPQu', photo:'assets/gifts/hp-shopper.webp', img:[433.3,7562.0], text:'left bottom', tw:454, dw:304},
  {id:19, n:'09.1', name:'мерч по гарри поттеру (2)', desc:'на манеже все те же', note:'кепка, доставка — около 600 ₽', price:'1 100 ₽', link:'https://clck.ru/3WhPm6', photo:'assets/gifts/hp-cap.webp', img:[768.3,7562.0], text:'below center', tw:359, dw:303, row:2},
  {id:21, n:'09.2', name:'мерч по гарри поттеру (3)', desc:'на манеже все те же', note:'футболка, доставка яндексом уже в цене — в пункт на пр. науки, 12', price:'1 700 ₽', link:'https://nottoday.ru/catalog/futbolki/24NT0512G7P', photo:'assets/gifts/hp-tshirt.webp', img:[1103.3,7562.0], text:'below center', tw:359, dw:303, row:2},
  {id:9, n:'10', name:'мармелад', desc:'я помешалась на “мармеладыче”. кислом. это все.', note:'1 кг, но можно и меньше — главное, чтобы кислый', price:'2 500 ₽', link:'https://www.wildberries.ru/catalog/237034373/detail.aspx', photo:'assets/gifts/marmelad.webp', img:[128.8,8373.6], text:'right top', tw:454},
  {id:14, n:'11', name:'магнитная доска', desc:'для дел, заметок и гениальных идей, которые приходят в голову в неподходящее время. может быть, хоть так они перестанут жить исключительно в моей голове', note:'если захотите, можно докупить маркеры и губку для доски', price:'1 400 ₽', link:'https://www.wildberries.ru/catalog/170178203/detail.aspx', photo:'assets/gifts/board.webp', img:[106.1,8843.6], text:'below center', tw:325, dw:256, row:1},
  {id:15, n:'12', name:'настольная лампа', desc:'поставлю на рабочий стол и буду изображать очень занятого творческого человека', price:'1 500 ₽', link:'https://www.wildberries.ru/catalog/1214326293/detail.aspx', photo:'assets/gifts/lamp.webp', img:[436.1,8843.6], text:'below center', tw:325, dw:256, row:1},
  {id:16, n:'13', name:'такса-подушка', desc:'добрались и до самого главного.\nдлинная мягкая такса, которую можно обнимать, тискать и использовать как подушку. никаких объяснений, просто посмотрите на неё!', price:'2 000 ₽', link:'https://clck.ru/3Wgb5s', photo:'assets/gifts/taksa.webp', img:[766.1,8843.6], text:'below center', tw:325, dw:256, row:1},
  {id:17, n:'14', name:'ваза', desc:'для сухих и не очень цветочков — такая, чтобы даже один случайный цветок в ней выглядел как маленькое произведение искусства.', note:'цена — с картой ozon', price:'1 500 ₽', link:'https://clck.ru/3WhV9Y', photo:'assets/gifts/vase.webp', img:[1096.1,8843.6], text:'below center', tw:325, dw:256, row:1},
  {id:10, n:'15', name:'сухие цветы', desc:'хочу сухие цветочки для комнаты. живые я тоже люблю, но эти хотя бы не будут смотреть на меня с укором, когда я забуду поменять воду', price:'700 ₽', link:'https://www.wildberries.ru/catalog/1127187390/detail.aspx?targetUrl=MI', photo:'assets/gifts/dried-flowers.webp', img:[1133.8,9612.8], text:'left bottom', tw:454, dw:303},
  {id:11, n:'16', name:'петличный микрофон', desc:'для моих блоггерских экспериментов, внезапных идей и видео, которые я, возможно, когда-нибудь начну снимать. пусть у будущей блогерки будет хороший звук ахах.', price:'2 200 ₽', link:'https://www.wildberries.ru/catalog/197401132/detail.aspx', photo:'assets/gifts/microphone.webp', img:[1133.8,9933.1], text:'left bottom', tw:454, dw:303}
];
const grid = document.querySelector('#gift-grid');
const toast = document.querySelector('.toast');
const tokenKey = 'lia-wishlist-token';
function guestToken(){try{let t=localStorage.getItem(tokenKey);if(!t){t=crypto.randomUUID();localStorage.setItem(tokenKey,t)}return t}catch{return guestToken.fallback||(guestToken.fallback=crypto.randomUUID())}}
let selected = new Set();
let others = new Set();
let busy = false;
// Брони у обеих копий сайта (Cloudflare и Yandex Cloud) общие: обе ходят в одну функцию в Yandex Cloud с базой
// YDB (yandex/function) — её видно и из России, и из-за границы. Локально (wrangler pages dev) — в функцию Cloudflare с локальной D1.
const apiUrl = location.hostname === 'localhost' ? '/api/reservations' : 'https://functions.yandexcloud.net/d4e7cj924hm5bo1cl0pk';
// Тайм-аут: зависший запрос иначе держит busy, и все кнопки перестают реагировать.
async function api(method,id){try{const res=await fetch(apiUrl,{method,headers:{'x-guest-token':guestToken(),'content-type':'application/json'},body:id===undefined?undefined:JSON.stringify({id}),signal:AbortSignal.timeout?.(15000)});return{ok:res.ok,data:await res.json().catch(()=>({}))}}catch{return{ok:false,data:{}}}}
function sync(data){if(Array.isArray(data.mine)&&Array.isArray(data.others)){selected=new Set(data.mine);others=new Set(data.others)}}
function notify(message,ms=2800){toast.textContent=message;toast.classList.add('is-visible');clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.classList.remove('is-visible'),ms)}
// Карточки строятся один раз; дальше при каждом опросе меняются только кнопки, фото и вёрстка не перерисовываются.
function render(){grid.innerHTML=gifts.map(({id,n,name,desc,note,price,link,photo,img,text,tw,dw,row})=>`<article class="gift ${text.split(' ').map(c=>'gift--'+c).join(' ')}"${row?` data-row="${row}"`:''} style="--ix:${img[0]};--iy:${img[1]};--tw:${tw};--dw:${dw||tw}"><p class="gift-num">(${n})</p><div class="gift-photo"><img src="${photo}" alt="${name}" decoding="async"></div><div class="gift-info"><h3>${name}</h3><p class="gift-desc">${desc}${note?`<span class="gift-note">${note}</span>`:''}</p><div class="gift-meta"><span>${price}</span><a href="${link}" target="_blank" rel="noopener">link</a></div><button class="reserve" type="button" data-id="${id}">подарю это</button></div></article>`).join('');alignRows()}
function flash(button){button.classList.remove('is-changed');void button.offsetWidth;button.classList.add('is-changed')}
// changed — подсветить кнопки, которые изменились не по нажатию этого гостя (кто-то занял или освободил подарок).
function update(changed){grid.querySelectorAll('.reserve').forEach(b=>{const id=Number(b.dataset.id),own=selected.has(id),taken=!own&&others.has(id),status=taken?'уже кто-то подарит':own?'ты даришь · отменить':'подарю это';if(b.textContent===status)return;b.textContent=status;b.disabled=taken;b.classList.toggle('is-own',own);if(changed)flash(b)})}
// Почти живые обновления: пока страницу смотрят, брони запрашиваются раз в 4 секунды; если её не трогали 2 минуты —
// раз в 20 секунд, 30 минут — опрос встаёт до первого касания; в фоновой вкладке не запрашиваются вовсе.
// epoch отбрасывает ответ опроса, ушедшего до нажатия, — иначе он на секунду вернул бы на экран старое состояние.
let epoch=0,polling=false,loaded=false,timer,lastActive=Date.now();
async function refresh(){if(busy||polling)return;polling=true;const e=epoch;const {ok,data}=await api('GET');polling=false;if(ok&&e===epoch&&!busy){sync(data);update(loaded);loaded=true}}
function schedule(){clearTimeout(timer);const idle=Date.now()-lastActive;if(!document.hidden&&idle<1800000)timer=setTimeout(async()=>{await refresh();schedule()},idle<120000?4000:20000)}
['pointerdown','pointermove','keydown','scroll','touchstart'].forEach(type=>addEventListener(type,()=>{const wasIdle=Date.now()-lastActive>120000;lastActive=Date.now();if(wasIdle){refresh();schedule()}},{passive:true}));
// На десктопе описания в одном ряду тянем до самого длинного, чтобы кнопки встали на одну линию.
const desktop=matchMedia('(min-width:1100px)');
function alignRows(){const rows={};grid.querySelectorAll('[data-row] .gift-desc').forEach(d=>{d.style.minHeight='';(rows[d.closest('[data-row]').dataset.row]??=[]).push(d)});if(!desktop.matches)return;Object.values(rows).forEach(descs=>{const h=Math.max(...descs.map(d=>d.offsetHeight));descs.forEach(d=>d.style.minHeight=h+'px')})}
addEventListener('resize',alignRows);
document.fonts.ready.then(alignRows);
// Двойную бронь не допускает сервер (проверка и запись — одной транзакцией); здесь — понятное сообщение тому, кто не успел.
grid.addEventListener('click',async(event)=>{const button=event.target.closest('.reserve');if(!button||button.disabled||busy)return;const id=Number(button.dataset.id);const cancel=selected.has(id);busy=true;epoch++;const {ok,data}=await api(cancel?'DELETE':'POST',id);busy=false;sync(data);update(false);if(ok)notify(cancel?'бронь отменена':'подарок забронирован ♡');else if(data.error==='taken'){flash(button);notify('кто-то выбрал этот подарок чуть раньше тебя — он уже занят. посмотри другие ♡',5000)}else if(data.error==='limit')notify('можно выбрать не больше двух подарков — чтобы взять этот, отмени один из своих',5000);else notify('не получилось связаться с сайтом — проверь интернет и попробуй ещё раз',5000)});
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(button.dataset.copy);notify('номер карты скопирован')}catch{notify('не удалось скопировать номер')}}));
render();
refresh();
schedule();
document.addEventListener('visibilitychange',()=>{if(!document.hidden){refresh();schedule()}});
