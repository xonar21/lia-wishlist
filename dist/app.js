// id — ключ брони в базе, менять нельзя; n — номер на сайте.
// at — где текст относительно фото на десктопе: l — справа от фото, r — слева, c — под фото.
// img: [x, y, размер рамки], info: [x, y, ширина] — координаты из макета Figma (1440px), dw — ширина описания.
const gifts = [
  {id:0, n:'01', name:'сертификат в фотостудию', desc:'хочу нарядиться, устроить фотосессию перед зеркалом.\nбез фотографа, чужих советов и необходимости объяснять, почему я делаю уже сороковой кадр — в целом, как дома, но более профессионально', price:'3 000 ₽', state:'open', at:'l', img:[217,3727,202], info:[435,3792,388]},
  {id:5, n:'02', name:'посуда из керамики своими руками', desc:'хочу попробовать сделать что-то красивое и несовершенное своими руками.\nчто-то свое, что-то обо мне', price:'3 000 ₽', state:'taken', at:'r', img:[992,3867,203], info:[807,4081,388], dw:219},
  {id:13, n:'03', name:'ирригатор', desc:'вклад в “мне тоже нравятся мои зубки”', price:'3 000 ₽', state:'reserved', at:'c', img:[435,4291,206], info:[399,4505,278], dw:219},
  {id:6, n:'04', name:'компьютерная мышка', desc:'новая РЕТРО мышка для работы, дизайна и всяких творческих дел. классная же?', price:'1 700 ₽', state:'taken', at:'r', img:[946,4692,207.67], info:[766,4917,388], dw:219},
  {id:12, n:'05', name:'картина по номерам', desc:'хочу раскрашивать красоту и потом созерцать. мозгу тоже нужен отпуск от бесконечных экзистенциальных вопросов.', price:'3 000 ₽', state:'reserved', at:'r', img:[329,5221,217], info:[64,5221,244], dw:219},
  {id:1, n:'05.1', name:'картина по номерам (2)', desc:'на манеже все те же', price:'3 000 ₽', state:'open', at:'l', img:[558,5221,217], info:[796,5301,388]},
  {id:18, n:'05.2', name:'картина по номерам (3)', desc:'на манеже все те же', price:'3 000 ₽', state:'open', at:'c', img:[559,5470,217], info:[528,5687,278], dw:219},
  {id:7, n:'06', name:'рукавички', desc:'тёплые и уютные, чтобы гулять по моему питеру и не мёрзнуть.', price:'3 000 ₽', state:'taken', at:'r', img:[1080,6228,205.4], info:[674,6233,388], dw:219},
  {id:2, n:'07', name:'проектор', desc:'чтобы устраивать домашние кинопоказы, смотреть фильмы на потолке во время свидания и делать вид, что у меня собственный маленький кинотеатр', price:'3 000 ₽', state:'open', at:'l', img:[532,6455,207.67], info:[764.67,6520,388]},
  {id:8, n:'08', name:'мерч по гарри поттеру', desc:'а как же без этого? подарите что-то из вариантов, чтобы они выдавали во мне человека, который все еще ждет письмо из хогвартса', price:'3 000 ₽', state:'taken', at:'r', img:[448.33,7103.98,207.67], info:[44,7189,388], dw:260},
  {id:19, n:'08.1', name:'мерч по гарри поттеру (2)', desc:'на манеже все те же', price:'3 000 ₽', state:'open', at:'c', img:[783.33,7103.98,207.67], info:[734,7329,307], dw:259},
  {id:3, n:'09', name:'носочки', desc:'носки с каким-нибудь странным рисунком, смешной надписью или просто такие, которые приятно надевать. у меня с ними отношения серьёзные', price:'3 000 ₽', state:'open', at:'l', img:[145,7817,205.4], info:[363,7817,388]},
  {id:9, n:'10', name:'мармелад', desc:'я помешалась на “мармеладыче”. кислом. это все.', price:'3 000 ₽', state:'taken', at:'r', img:[1087,8158,205.4], info:[674,8226,388], dw:259},
  {id:14, n:'11', name:'магнитная доска', desc:'для дел, заметок и гениальных идей, которые приходят в голову в неподходящее время. может быть, хоть так они перестанут жить исключительно в моей голове', price:'3 000 ₽', state:'reserved', at:'c', img:[153,8570,206], info:[117,8784,278], dw:219},
  {id:15, n:'12', name:'настольная лампа', desc:'поставлю на рабочий стол и буду изображать очень занятого творческого человека', price:'3 000 ₽', state:'open', at:'c', img:[463,8570,206], info:[427,8784,276], dw:219},
  {id:16, n:'13', name:'такса-подушка', desc:'добрались и до самого главного.\nдлинная мягкая такса, которую можно обнимать, тискать и использовать как подушку. никаких объяснений, просто посмотрите на неё!', price:'3 000 ₽', state:'taken', at:'c', img:[773,8570,206], info:[737,8784,277], dw:219},
  {id:17, n:'14', name:'ваза', desc:'для сухих и не очень цветочков — такая, чтобы даже один случайный цветок в ней выглядел как маленькое произведение искусства.', price:'3 000 ₽', state:'reserved', at:'c', img:[1083,8570,206], info:[1047,8784,278], dw:219},
  {id:10, n:'15', name:'сухие цветы', desc:'хочу сухие цветочки для комнаты. живые я тоже люблю, но эти хотя бы не будут смотреть на меня с укором, когда я забуду поменять воду', price:'3 000 ₽', state:'taken', at:'r', img:[1150,9245,205.4], info:[737,9313,388], dw:259},
  {id:11, n:'16', name:'петличный микрофон', desc:'для моих блоггерских экспериментов, внезапных идей и видео, которые я, возможно, когда-нибудь начну снимать. пусть у будущей блогерки будет хороший звук ахах.', price:'3 000 ₽', state:'taken', at:'r', img:[1150,9526,205.4], info:[737,9594,388], dw:259},
  {id:4, n:'17', name:'свидание (?)', desc:'маленькое приключение: новое место, странная выставка, что-то вкусное или просто место, куда я бы не догадалась пойти. обсуждаемо :))))))))', price:'? ??? ₽', state:'open', at:'l', img:[131,9846,205.4], info:[349,9846,388]}
];
const grid = document.querySelector('#gift-grid');
const toast = document.querySelector('.toast');
const tokenKey = 'lia-wishlist-token';
function guestToken(){try{let t=localStorage.getItem(tokenKey);if(!t){t=crypto.randomUUID();localStorage.setItem(tokenKey,t)}return t}catch{return guestToken.fallback||(guestToken.fallback=crypto.randomUUID())}}
let selected = new Set();
let others = new Set();
let busy = false;
async function api(method,id){try{const res=await fetch('/api/reservations',{method,headers:{'x-guest-token':guestToken(),'content-type':'application/json'},body:id===undefined?undefined:JSON.stringify({id})});return{ok:res.ok,data:await res.json().catch(()=>({}))}}catch{return{ok:false,data:{}}}}
function sync(data){if(Array.isArray(data.mine)&&Array.isArray(data.others)){selected=new Set(data.mine);others=new Set(data.others)}}
async function refresh(){if(busy)return;const {ok,data}=await api('GET');if(ok){sync(data);render()}}
function notify(message){toast.textContent=message;toast.classList.add('is-visible');clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.classList.remove('is-visible'),2800)}
function render(){grid.innerHTML=gifts.map(({id,n,name,desc,price,state,at,img,info,dw})=>{const own=selected.has(id);const unavailable=!own&&(state==='taken'||state==='reserved'||others.has(id));const status=unavailable?'уже кто-то подарит':own?'ты даришь · отменить':'подарю это';return `<article class="gift gift--${at}" style="--ix:${img[0]};--iy:${img[1]};--is:${img[2]};--tx:${info[0]};--ty:${info[1]};--tw:${info[2]};--dw:${dw||info[2]}"><p class="gift-num">(${n})</p><div class="gift-photo"><img src="assets/gift.webp" alt="${name}" decoding="async"></div><div class="gift-info"><h3>${name}</h3><p class="gift-desc">${desc}</p><div class="gift-meta"><span>${price}</span><a href="#contacts">link</a></div><button class="reserve${own?' is-own':''}" type="button" data-id="${id}" ${unavailable?'disabled':''}>${status}</button></div></article>`}).join('')}
grid.addEventListener('click',async(event)=>{const button=event.target.closest('.reserve');if(!button||button.disabled||busy)return;const id=Number(button.dataset.id);const cancel=selected.has(id);busy=true;const {ok,data}=await api(cancel?'DELETE':'POST',id);busy=false;sync(data);if(ok)notify(cancel?'бронь отменена':'подарок забронирован ♡');else if(data.error==='limit')notify('можно выбрать не больше двух подарков');else if(data.error==='taken')notify('этот подарок уже забронировал кто-то другой');else notify('не получилось, попробуй ещё раз');render()});
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(button.dataset.copy);notify('номер карты скопирован')}catch{notify('не удалось скопировать номер')}}));
render();
refresh();
setInterval(refresh,30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
