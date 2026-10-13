import { ArrowUpRight, Check, FileJson, Image, MessageSquare, MonitorSmartphone, ShieldCheck } from 'lucide-react';
import articles from '../content/articles.json';

export const faq=[
 ['Как создать фейк-переписку в Telegram онлайн?','Откройте редактор, добавьте реплики вручную или загрузите JSON. Задайте имя, аватар, время и тему. В предпросмотре появится постановочный диалог в стиле iPhone. Для сохранения файла нужен ключ.'],
 ['Что можно делать бесплатно?','Создавать и редактировать переписки, загружать JSON и фотографии, настраивать оформление и смотреть результат. Бесплатный режим не ограничен водяным знаком в предпросмотре; скачивание PNG, HTML и JSON требует ключ.'],
 ['Что означает «одно скачивание»?','Один успешно подготовленный файл: PNG, HTML или JSON. Если при подготовке файла возникнет ошибка, попытка сохранится. Отмена сохранения в системном окне браузера не возвращает скачивание.'],
 ['Какое разрешение у скриншота переписки?','Ширина экрана — 393 логических пикселя. Экспорт 3× даёт ширину 1179 пикселей; при высоте экрана 852 получается 1179 × 2556. Для всей переписки высота зависит от количества сообщений. Рамка телефона в PNG не добавляется.'],
 ['Можно ли загрузить переписку из JSON?','Да. Нужен формат Chat Studio с массивом messages. Произвольный архив Telegram Desktop нужно предварительно преобразовать. Поля и примеры есть в разделе «Формат JSON» редактора и в инструкции по импорту.'],
 ['Где хранятся мои переписки?','В браузере на вашем устройстве. Тексты и фотографии не отправляются платёжному серверу. Автосохранение привязано к адресу сайта и профилю браузера; для переноса и резервной копии используйте проект JSON.'],
 ['Как получить ключ после оплаты?','После оплаты вернитесь в редактор и нажмите «Проверить заказ». Когда сервер подтвердит платёж, ключ появится на экране. Сохраните его для другого браузера. Отправка ключа на email сейчас не предусмотрена.'],
 ['Есть ли WhatsApp и экспорт видео?','Сейчас поддерживается макет Telegram, экспорт PNG, HTML и JSON. Шаблон WhatsApp и анимированное видео не входят в возможности редактора. PNG можно использовать как кадр в отдельном видеоредакторе.'],
 ['Это официальный сервис Telegram?','Нет. Chat Studio — независимый редактор макетов для творческих проектов, мемов и демонстраций интерфейса. Он не подключается к вашему аккаунту Telegram.']
];

export function ArticleCards({limit}:{limit?:number}){return <div className="article-grid">{articles.slice(0,limit).map((a,i)=><a className="article-card" href={`/blog/${a.slug}/`} key={a.slug}><div className={`article-cover cover-${i%3}`}><span>{['{ }','↗','9:41','PNG','✳','▧'][i]}</span><small>{a.category}</small></div><div className="article-card-body"><span>{a.category} · {a.minutes} мин</span><h3>{a.title}</h3><p>{a.description}</p><strong>Читать инструкцию <ArrowUpRight size={16}/></strong></div></a>)}</div>;}

export function MoreFeatures(){const items=[
 [MessageSquare,'Сообщения и реакции','Входящие и исходящие реплики, цитаты, даты, время и галочки. Скругления объединяют сообщения одного автора.'],
 [Image,'Фотографии и аватары','Загружайте JPG, PNG или WebP. Добавляйте подписи к фото и меняйте аватар собеседника.'],
 [MonitorSmartphone,'Экран в стиле iPhone','Настраивайте часы, Wi-Fi или мобильную сеть, сигнал и батарею. Переключайте тему и Dynamic Island.'],
 [FileJson,'Импорт и резервная копия','Загружайте JSON, подготовленный вручную или внешним ИИ. Экспорт проекта сохраняет сообщения вместе с фото.'],
 [ShieldCheck,'Локальная работа','Переписка хранится в браузере. Для создания макета не нужен аккаунт или вход в Telegram.'],
 [Check,'Три формата результата','Сохраните видимый экран или всю историю в PNG. Выберите HTML для просмотра и JSON для дальнейших правок.']
 ] as const;return <div className="capability-grid">{items.map(([Icon,title,text])=><article key={title}><Icon size={23}/><h3>{title}</h3><p>{text}</p></article>)}</div>;}

export function Examples(){return <section className="landing-section examples-section reveal" id="examples"><div className="section-intro"><div><div className="landing-eyebrow">ПРИМЕРЫ МАКЕТОВ</div><h2>Один редактор.<br/><span>Разные истории.</span></h2></div><p>Вымышленные диалоги для контента,<br/>сценариев и учебных материалов.</p></div><div className="example-grid">{[
 {title:'Мем о планах',tag:'Короткий диалог',messages:['Ты уже вышел?','Почти','Что осталось?','Проснуться']},
 {title:'Сцена для истории',tag:'Персонажи и настроение',messages:['Ты видел свет в окне?','Да. Хотя дом пустует','Значит, мы пришли вовремя']},
 {title:'Учебный пример',tag:'Ясная коммуникация',messages:['Когда удобно обсудить проект?','Завтра в 11:00','Отлично. Пришлю повестку заранее']}
 ].map((example,i)=><article key={example.title}><div className={`example-chat example-${i}`}><div className="example-chat-header"><span>Демонстрационный чат</span><small>Сегодня</small></div>{example.messages.map((m,j)=><div className={`example-bubble ${j%2?'out':''}`} key={m}>{m}<small>10:{24+j} {j%2?'✓✓':''}</small></div>)}</div><h3>{example.title}</h3><p>{example.tag}</p><a href="/app">Создать свой вариант <ArrowUpRight size={15}/></a></article>)}</div></section>;}

export function Comparison(){return <section className="landing-section comparison-section reveal"><div className="section-intro"><div><div className="landing-eyebrow">КАК ВЫБРАТЬ ИНСТРУМЕНТ</div><h2>Редактор чата, скриншот<br/><span>или графический редактор?</span></h2></div></div><p className="section-description">Для настоящего разговора подходит обычный скриншот. Для придуманного сценария удобнее конструктор: он позволяет менять реплики и детали экрана без сборки каждого пузыря вручную.</p><div className="comparison-scroll"><table><caption>Способы подготовить изображение переписки</caption><thead><tr><th scope="col">Задача</th><th scope="col">Chat Studio</th><th scope="col">Скриншот реального чата</th><th scope="col">Графический редактор</th></tr></thead><tbody>{[
 ['Написать обе стороны диалога','Вручную или из JSON','Нужен реальный диалог','Текст собирается вручную'],
 ['Изменить тему, время и батарею','Настройки в интерфейсе','Зависит от устройства','Нужно редактировать изображение'],
 ['Продолжить работу над макетом','Локальный проект и JSON','Новый скриншот','Исходник выбранного редактора'],
 ['Получить готовый файл','PNG, HTML или JSON по ключу','Изображение средствами устройства','Форматы зависят от программы']
 ].map(row=><tr key={row[0]}>{row.map((cell,i)=>i===0?<th scope="row" key={i}>{cell}</th>:<td key={i}>{cell}</td>)}</tr>)}</tbody></table></div></section>;}

export function Reviews(){return <section className="landing-section reviews-section reveal" id="reviews"><div className="section-intro"><div><div className="landing-eyebrow">ОБРАТНАЯ СВЯЗЬ</div><h2>Отзывы о редакторе</h2></div><p>Ниже — примеры оформления отзывов.<br/>Они не являются отзывами реальных клиентов.</p></div><div className="review-grid">{[
 ['Автор коротких видео','Для короткого диалога удобно менять последнюю реплику прямо в предпросмотре. Важно проверить читаемость уже на телефоне: длинный текст лучше сокращать.'],
 ['Автор сценариев','Импорт JSON помогает, когда разговор уже написан. Фотографии нужно загрузить отдельно с теми же именами — после этого они появляются в переписке.'],
 ['Дизайнер презентаций','Полезно выбирать между PNG и проектом JSON. Первый подходит для слайда, второй — чтобы позже поправить текст. Для двух файлов разового скачивания недостаточно.']
 ].map(([role,text])=><article key={role}><span className="review-label">Демонстрационный отзыв</span><blockquote>«{text}»</blockquote><div className="review-author"><span>{role[0]}</span><strong>{role}<small>Пример сценария использования</small></strong></div></article>)}</div><p className="review-note">Раздел готов для подтверждённых отзывов с разрешения авторов. Рейтинг и число клиентов появятся только при наличии реальных данных.</p></section>;}

export function Guides(){return <section className="landing-section guides-section reveal" id="guides"><div className="section-intro"><div><div className="landing-eyebrow">ПОЛЕЗНО ПЕРЕД СТАРТОМ</div><h2>Как создать переписку<br/><span>и сохранить результат.</span></h2></div><a className="landing-text-link" href="/blog/">Все инструкции <ArrowUpRight size={17}/></a></div><ArticleCards limit={6}/></section>;}
