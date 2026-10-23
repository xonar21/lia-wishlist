const gifts = [
  ['сертификат в фотостудию','хочу нарядиться, устроить фотосессию перед зеркалом. без фотографа, чужих советов и необходимости объяснять, почему я делаю уже сороковой кадр — в целом, как дома, но более профессионально','3 000 ₽','open'],
  ['картина по номерам (2)','на манеже все те же','3 000 ₽','open'],
  ['проектор','чтобы устраивать домашние кинопоказы, смотреть фильмы на потолке во время свидания и делать вид, что у меня собственный маленький кинотеатр','3 000 ₽','open'],
  ['носочки','носки с каким-нибудь странным рисунком, смешной надписью или просто такие, которые приятно надевать. у меня с ними отношения серьёзные','3 000 ₽','open'],
  ['свидание (?)','маленькое приключение: новое место, странная выставка, что-то вкусное или просто место, куда я бы не догадалась пойти. обсуждаемо :))))))))','? ??? ₽','open'],
  ['посуда из керамики своими руками','хочу попробовать сделать что-то красивое и несовершенное своими руками. что-то своё, что-то обо мне','3 000 ₽','taken'],
  ['компьютерная мышка','новая РЕТРО мышка для работы, дизайна и всяких творческих дел. классная же?','1 700 ₽','taken'],
  ['рукавички','тёплые и уютные, чтобы гулять по моему питеру и не мёрзнуть.','3 000 ₽','taken'],
  ['мерч по гарри поттеру','а как же без этого? подарите что-то из вариантов, чтобы они выдавали во мне человека, который всё ещё ждёт письмо из хогвартса','3 000 ₽','taken'],
  ['мармелад','я помешалась на «мармеладыче». кислом. это всё.','3 000 ₽','taken'],
  ['сухие цветы','хочу сухие цветочки для комнаты. живые я тоже люблю, но эти хотя бы не будут смотреть на меня с укором, когда я забуду поменять воду','3 000 ₽','taken'],
  ['петличный микрофон','для моих блоггерских экспериментов, внезапных идей и видео, которые я, возможно, когда-нибудь начну снимать. пусть у будущей блогерки будет хороший звук ахах.','3 000 ₽','taken'],
  ['картина по номерам','хочу раскрашивать красоту и потом созерцать. мозгу тоже нужен отпуск от бесконечных экзистциальных вопросов.','3 000 ₽','reserved'],
  ['ирригатор','вклад в «мне тоже нравятся мои зубки»','3 000 ₽','reserved'],
  ['магнитная доска','для дел, заметок и гениальных идей, которые приходят в голову в неподходящее время. может быть, хоть так они перестанут жить исключительно в моей голове','3 000 ₽','reserved'],
  ['настольная лампа','поставлю на рабочий стол и буду изображать очень занятого творческого человека','3 000 ₽','open'],
  ['такса-подушка','добрались и до самого главного. длинная мягкая такса, которую можно обнимать, тискать и использовать как подушку. никаких объяснений, просто посмотрите на неё!','3 000 ₽','taken'],
  ['ваза','для сухих и не очень цветочков — такая, чтобы даже один случайный цветок в ней выглядел как маленькое произведение искусства.','3 000 ₽','reserved']
];
const grid = document.querySelector('#gift-grid');
const toast = document.querySelector('.toast');
let selected = new Set(JSON.parse(localStorage.getItem('lia-wishlist-reservations') || '[]'));
function notify(message){toast.textContent=message;toast.classList.add('is-visible');clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.classList.remove('is-visible'),2800)}
function render(){grid.innerHTML=gifts.map(([name,description,price,state],index)=>{const own=selected.has(index);const unavailable=state==='taken';const status=unavailable?'уже кто-то подарит':own||state==='reserved'?'ты даришь · отменить':'подарю это';return `<article class="gift-card ${own?'reserved':''}" style="--tilt:${(index%3-1)*2.2}deg"><div class="gift-art"><span class="gift-index">(${String(index+1).padStart(2,'0')})</span><img src="assets/raw-10.png" alt="${name}"></div><div class="gift-info"><h3>${name}</h3><p>${description}</p><div class="gift-meta"><span>${price}</span><a href="#contacts">link ↗</a></div><button class="reserve" data-id="${index}" ${unavailable?'disabled':''}>${status}</button></div></article>`}).join('')}
grid.addEventListener('click',(event)=>{const button=event.target.closest('.reserve');if(!button||button.disabled)return;const id=Number(button.dataset.id);if(selected.has(id)){selected.delete(id);notify('бронь отменена')}else if(selected.size>=2){notify('можно выбрать не больше двух подарков')}else{selected.add(id);notify('подарок забронирован ♡')}localStorage.setItem('lia-wishlist-reservations',JSON.stringify([...selected]));render()});
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(button.dataset.copy);notify('номер карты скопирован')}catch{notify('не удалось скопировать номер')}}));
render();
