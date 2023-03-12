//@ts-check

// JSDoc型定義

/**
 * @typedef CardData
 * @property {string} attribute 属性
 * @property {string} date 日付
 * @property {string} text 本文
 * @property {string} summary 
 * @property {string} quote 発信者
 * @property {string} source ソース
 */

/**
 * @typedef ColorData
 * @property {string} name 色名
 * @property {string} code カラーコード
 */

/**
 * @typedef HistoryData
 * @property {string} num カードナンバー
 * @property {string} key 編集項目
 * @property {string} before 編集前データ
 * @property {string} date 編集日時
 */


// 汎用

/** @param {string} id */
const $ = (id) => document.getElementById(id);

function getDateData(dateObj = new Date()) {
    return {
        yyyy: dateObj.getFullYear(),
        yy: dateObj.getFullYear().toString().slice(-2),
        m: dateObj.getMonth() + 1,
        mm: ('00' + (dateObj.getMonth() + 1)).slice(-2),
        d: dateObj.getDate(),
        dd: ('00' + dateObj.getDate()).slice(-2),
        h: dateObj.getHours(),
        hh: ('00' + dateObj.getHours()).slice(-2),
        n: dateObj.getMinutes(),
        nn: ('00' + dateObj.getMinutes()).slice(-2),
        s: dateObj.getSeconds(),
        ss: ('00' + dateObj.getSeconds()).slice(-2),
        day: dateObj.getDay(),
    };
}
function dateAndTime(format = 'yyyy-mm-ddThh:nn', date) {
    const dateObj = !date ? new Date()
        : (typeof date == 'string' || typeof date == 'number') ? new Date(date)
            : date;
    const { yyyy, yy, mm, m, dd, d, hh, h, nn, n, ss, s } = getDateData(dateObj);
    return format.replace('yyyy', yyyy.toString()).replace('yy', yy)
        .replace('mm', mm).replace('m', m.toString())
        .replace('dd', dd).replace('d', d.toString())
        .replace('hh', hh).replace('h', h.toString())
        .replace('nn', nn).replace('n', n.toString())
        .replace('ss', ss).replace('s', s.toString())
        .replace('年月日', `${yyyy}年${m}月${d}日`)
        .replace('時分', `${h}時${n}分`);
}

const random = (x, y) => Math.floor(Math.random() * (y - x + 1)) + x; // 最小値x、最大値yの乱数を作る


// localStorage用

/** @param {{name:string,default:Promise,data:any[]}} dataType */
const loadData = (dataType) => {
    if (!localStorage.hasOwnProperty(dataType.name) || !localStorage.getItem(dataType.name)) { // 初回のみ発動
        //const data = dataType.default;
        return dataType.default.then(data => {
            localStorage.setItem(dataType.name, data);
            return JSON.parse(data);
        })
    } else {
        const data = /** @type {string} */(localStorage.getItem(dataType.name));
        return new Promise((resolve) => resolve(JSON.parse(data)));
        //return JSON.parse(data);
    }
}

/** @param {{name:string,default:Promise,data:any[]}} dataType */
const saveData = (dataType) => localStorage.setItem(dataType.name, JSON.stringify(dataType.data))


// 定数・設定類

const CLASS = {
    hidden: 'hidden',
    card: 'flex-item',
    // カードの種別
    pickup: 'pickup',
    important: 'important',
    trush: 'trush',
    quote: 'quote',
    // カード内
    cardText: 'card-text',
    cardSource: 'card-source',
    cardFooter: 'card-footer',
    cardMask: 'masked',
    cardNumber: 'card-number',
}

const dataSet = {
    data: {
        name: 'Cards-data',
        default: fetch('./sample.json').then(res => res.text()),
        get data() { return DATA.card.slice() },
    },
    color: {
        name: 'Color',
        default: fetch('./color.json').then(res => res.text()),
        get data() { return DATA.color.slice() },
    },
    history: {
        name: 'Cards-history',
        default: new Promise((resolve) => resolve('[]')),
        get data() { return DATA.history.slice() },
    }
}

/** @type {{
 * key: string[],
 * card: CardData[],
 * color: ColorData[],
 * history: HistoryData[],
 * }} */
const DATA = {
    key: ["attribute", "date", "text", "quote", "source"],
    card: [],
    color: [],
    history: [],
}

const $$ = {
    get main() { return document.getElementsByTagName('main')[0] },
    div: {
        search: /** @type {HTMLDivElement} */($('search')),
        detail: /** @type {HTMLDivElement} */($('detail')),
        history: /** @type {HTMLDivElement} */($('history')),
    },
    button: {
        search: /** @type {HTMLButtonElement} */($('search-button')),
        all: /** @type {HTMLButtonElement} */($('all')),
        renderCardsDesc: /** @type {HTMLButtonElement} */($('render-cards-desc')),
        renderCardsAsc: /** @type {HTMLButtonElement} */($('render-cards-asc')),
        renderCardsRandom: /** @type {HTMLButtonElement} */($('render-cards-random')),
        toggleQuote: /** @type {HTMLButtonElement} */($('toggle-quote')),
        toggleTrush: /** @type {HTMLButtonElement} */($('toggle-trush')),
        openDetail: /** @type {HTMLButtonElement} */($('open-detail')),
        openHistory: /** @type {HTMLButtonElement} */($('open-history')),
        download: /** @type {HTMLButtonElement} */($('data-download')),
        downloadToScrapbox: /** @type {HTMLButtonElement} */($('data-downloadSB')),
        detailClear: /** @type {HTMLButtonElement} */($('detail-clear')),
        detailUpdate: /** @type {HTMLButtonElement} */($('detail-update')),
        detailReset: /** @type {HTMLButtonElement} */($('detail-reset')),
        openThisHistory: /** @type {HTMLButtonElement} */($('open-this-history')),
    },
    input: {
        search: /** @type {HTMLInputElement} */($('search-box')),
        numStart: /** @type {HTMLInputElement} */($('num-start')),
        numLast: /** @type {HTMLInputElement} */($('num-last')),
        numRandom: /** @type {HTMLInputElement} */($('num-random')),
    },
    table: {
        history: /** @type {HTMLTableElement} */($('history-table')),
        get historyBody() { return /** @type {HTMLTableSectionElement} */($$.table.history.querySelector('tbody')) },
    },
    ul: {
        cards: /** @type {HTMLUListElement} */($('cards')),
        pickup: /** @type {HTMLUListElement} */($('pickup')),
    },
    span: {
        num: /** @type {HTMLSpanElement} */($('card-num')),
        statusSearch: /** @type {HTMLDivElement} */($('status-search')),
        statusDisplay: /** @type {HTMLDivElement} */($('status-display')),
        statusCount: /** @type {HTMLDivElement} */($('status-count')),
        statusQuote: /** @type {HTMLDivElement} */($('status-quote')),
    }
}


// 初期化、イベントリスナー設定等

const config = {
    build() {
        (function (num) {
            $$.input.numStart.max = num;
            $$.input.numLast.max = num;
            $$.input.numLast.value = num;
            $$.span.statusCount.textContent = num;
            $$.input.numRandom.max = num;
        })(DATA.card.length.toString());
        for (const key of DATA.key) {
            const label = $$.div.detail.appendChild(document.createElement('p'));
            label.textContent = key;
            const textarea = $$.div.detail.appendChild(document.createElement('textarea'));
            textarea.rows = key == 'text' ? 5 : 1;
            textarea.id = `edit-${key}`;
            textarea.title = key == 'date' ? '任意の日付を入力'
                : key == 'text' ? '本文のテキストを入力'
                    : key == 'quote' ? '引用の場合は出典を入力'
                        : key == 'source' ? 'URLがあれば入力'
                            : '';
            if (key == 'attribute') {
                const arr = [
                    '！：重要',
                    'P：Pickup欄に表示',
                    'X：トラッシュに設定',
                ]
                const map = DATA.color.map(obj => `/${obj.name}/：${obj.code}`);
                textarea.title = arr.join('\n') + '\n' + map.join('\n');
            }
        }
    },
    resetRange: () => {
        $$.input.numStart.value = '1';
        $$.input.numLast.value = DATA.card.length.toString();
    },
    resetText: () => {
        $$.span.statusSearch.textContent = '';
        //$$.span.statusQuote.textContent = '引用表示';
    },
    addEvents() {
        $$.button.search.addEventListener('click', search);
        $$.button.all.addEventListener('click', config.resetRange);
        $$.button.renderCardsDesc.addEventListener('click', render.desc);
        $$.button.renderCardsAsc.addEventListener('click', render.asc);
        $$.button.renderCardsRandom.addEventListener('click', render.random);

        $$.button.toggleQuote.addEventListener('click', () => {
            const attr = 'data-quote';
            const setStatus = (value, status, button) => {
                $$.main.setAttribute(attr, value);
                $$.span.statusQuote.textContent = status;
                $$.button.toggleQuote.textContent = button;
            }
            const value = {
                except: 'except-quote',
                only: 'only-quote',
            }
            $$.main.getAttribute(attr) == value.except ? setStatus(value.only, '引用のみ表示', '両方表示に')
                : $$.main.getAttribute(attr) == value.only ? setStatus('', '引用表示', '引用非表示に')
                    : setStatus(value.except, '引用非表示', '引用のみに');
        })

        $$.button.toggleTrush.addEventListener('click', () => {
            const attr = 'data-trush';
            if ($$.main.getAttribute(attr) == 'true') {
                $$.main.setAttribute(attr, 'false');
                $$.button.toggleTrush.textContent = 'Trushを表示';
            } else {
                $$.main.setAttribute(attr, 'true');
                $$.button.toggleTrush.textContent = 'Trushを非表示';
            }
        })

        $$.button.openDetail.addEventListener('click', () => {
            detail.clear();
            $$.div.detail.classList.toggle(CLASS.hidden);
        })
        $$.button.openHistory.addEventListener('click', () => {
            hx.showAll();
            $$.div.history.classList.toggle(CLASS.hidden);
        })
        $$.main.addEventListener('click', () => {
            $$.div.detail.classList.add(CLASS.hidden);
            $$.div.history.classList.add(CLASS.hidden);
        })
        $$.button.openThisHistory.addEventListener('click', () => hx.filter())

        $$.button.detailClear.addEventListener('click', detail.clear);

        $$.button.detailReset.addEventListener('click', () => {
            // DATA.cardの中身を書き出し直す
            const cardnum = $$.span.num.textContent;
            detail.clear();
            $$.span.num.textContent = cardnum;
            const num = Number(cardnum) - 1;
            for (let item in DATA.card[num]) { // 割り出した配列番号を元にオブジェクト内を全て取り出す
                const target = /** @type {HTMLTextAreaElement} */($(`edit-${item}`));
                target.value = DATA.card[num][item]; // プロパティを初期値とする
            }
        })

        $$.button.detailUpdate.addEventListener('click', () => {
            detail.update();
            hx.filter();
        });
    }
}


// 以下各処理

const render = {
    item(index, order) { // i番目のカードを作るfunction
        const data = DATA.card[index];
        const isPickup = data.attribute.includes('P');
        const isImportant = data.attribute.includes('！');
        const isTrush = data.attribute.includes('X');
        const target = isPickup ? $$.ul.pickup : $$.ul.cards;

        const item = document.createElement('li');
        order == 'desc' ? target.prepend(item) : target.append(item);
        item.className = CLASS.card;
        if (isPickup) item.classList.add(CLASS.pickup);
        if (isImportant) item.classList.add(CLASS.important); // 「！」をつけたカードは文字色を赤に
        if (isTrush) item.classList.add(CLASS.trush);
        if (data.quote) item.classList.add(CLASS.quote);
        DATA.color.some(obj => {
            if (data.attribute.includes(`/${obj.name}/`)) { // 同じ文字を含む別な色に当たらないように仕切り文字を使用
                item.style.backgroundColor = obj.code;
                return true;
            }
        })
        item.addEventListener('click', () => {
            detail.set(index);
            hx.filter();
            setTimeout(() => {
                $$.div.detail.classList.remove(CLASS.hidden);
                $$.div.history.classList.remove(CLASS.hidden);
            }, 10)
        });

        const text = item.appendChild(document.createElement('p'));
        text.className = CLASS.cardText;
        text.textContent = data.text;
        text.title = data.text.replace('<br>', '\n');
        if (data.quote) {
            text.textContent += `\n（${data.quote}）`;
            text.title += `\n（${data.quote}）`;
        }

        if (data.source && data.source.match(/(h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+)/)) {
            const source = item.appendChild(document.createElement('a'));
            source.className = CLASS.cardSource;
            source.href = data.source;
            source.title = decodeURI(data.source);
            source.target = '_blank';
            source.rel = 'noopener noreferrer';
            const img = source.appendChild(document.createElement('img'));
            img.src = 'https://gyazo.com/ad778f90a65473f47666ab83b437a2e9/raw'; // https://scrapbox.io/emoji/link
        }

        const footer = item.appendChild(document.createElement('div'));
        footer.className = CLASS.cardFooter;

        const mask = footer.appendChild(document.createElement('p'));
        mask.textContent = data.attribute;
        mask.className = CLASS.cardMask;

        const number = footer.appendChild(document.createElement('p'));
        number.className = CLASS.cardNumber;
        number.textContent = (index + 1).toString();

        return item;
    },
    getValue(type) {
        $$.ul.cards.innerHTML = '';
        $$.ul.pickup.innerHTML = '';
        const start = Number($$.input.numStart.value);
        const last = Number($$.input.numLast.value);
        const num = Number($$.input.numRandom.value) > last - start + 1 ? last - start + 1 : Number($$.input.numRandom.value);
        const text = `[${type}]No.${start}からNo.${last}まで ${type == 'Random' ? num : last - start + 1}件生成`;
        $$.span.statusDisplay.textContent = text;
        return { start: start, last: last, num: num };
    },
    ordered(startnum, lastnum, order) { // inputに入力した数字を使用
        for (let i = startnum - 1; i < lastnum; i++) {
            render.item(i, order);
        }
        config.resetText();
    },
    desc() {
        const { start, last } = render.getValue('降順');
        render.ordered(start, last, 'desc');
    },
    asc() {
        const { start, last } = render.getValue('昇順');
        render.ordered(start, last, 'asc');
    },
    random() {
        const { start, last, num } = render.getValue('Random');
        let r = 0;
        const used = [];
        for (let i = 0; i < num; i++) {
            do {
                r = random(start - 1, last - 1);
            } while (used.includes(r));
            render.item(r, 'desc');
            used.push(r);
        }
        config.resetText();
    }
}

const detail = {
    set(index) {
        $$.span.num.textContent = (index + 1).toString();
        for (const key of DATA.key) {
            const input = /** @type {HTMLTextAreaElement} */($(`edit-${key}`))
            input.value = DATA.card[index][key];
        }
    },
    clear() {
        $$.span.num.textContent = '';
        const textarea = $$.div.detail.getElementsByTagName('textarea');
        for (const area of textarea) {
            area.value = '';
        }
        textarea[1].value = dateAndTime("yyyy/mm/dd");
    },
    get() {
        const textarea = $$.div.detail.getElementsByTagName('textarea');
        const newdata = {};
        for (let i = 0; i < DATA.key.length; i++) {
            newdata[DATA.key[i]] = textarea[i].value || '';
        }
        return /** @type {CardData} */(newdata);
    },
    update() {
        const cardnum = $$.span.num.textContent;
        if (cardnum) {
            hx.add(Number(cardnum) - 1);
        } else { // 新規追加の場合
            DATA.card.push(detail.get());
            const order = $$.span.statusDisplay.innerText.includes("降順") ? 'desc' : 'asc';
            render.item(DATA.card.length - 1, order); // 最大値＝新規追加カードを作成
            detail.clear();
            $$.span.statusCount.textContent = DATA.card.length.toString(); // 件数表示を更新
            config.resetRange(); // 何番から何番までの指定を更新
        }
        saveData(dataSet.data);
    },
}

const hx = {
    inputs: $$.div.detail.getElementsByTagName('textarea'),
    render() {
        const tbody = /** @type {HTMLTableSectionElement} */($$.table.history.querySelector("tbody"));
        tbody.innerHTML = '';
        for (const log of DATA.history) {
            const row = document.createElement('tr');
            tbody.prepend(row);
            for (const key in log) {
                if (Object.hasOwnProperty.call(log, key)) {
                    const cell = row.appendChild(document.createElement('td'));
                    cell.innerHTML = log[key];
                    if (key == 'num') {
                        cell.style.cursor = 'pointer';
                        cell.addEventListener('click', () => detail.set(Number(log[key]) - 1));
                    } else if (key == 'date') {
                        cell.textContent = dateAndTime('yyyy/mm/dd hh:nn', log[key]);
                    }
                }
            }
            row.title = DATA.card[Number(log.num) - 1].text;
        }
    },
    add(index) {
        for (let i = 0; i < DATA.key.length; i++) {
            const key = DATA.key[i];
            const textarea = hx.inputs[i];
            if (DATA.card[index][key] == textarea.value) continue;
            DATA.history.push({
                num: index + 1,
                key: key,
                before: DATA.card[index][key],
                date: dateAndTime("yyyy-mm-ddThh:nn:ss"),
            });
            DATA.card[index][key] = textarea.value;
            saveData(dataSet.history);
        }
    },
    filter() {
        hx.render();
        const num = $$.span.num.textContent;
        const rows = $$.table.historyBody.getElementsByTagName('tr');
        for (const row of rows) {
            row.cells[0].textContent != num ? row.classList.add(CLASS.hidden) : row.classList.remove(CLASS.hidden);
            //if (row.cells[0].textContent != num) row.classList.add(CLASS.hidden);
        }
    },
    showAll() {
        const rows = $$.table.historyBody.getElementsByTagName('tr');
        for (const row of rows) {
            row.classList.remove(CLASS.hidden);
        }
    }
}

function search() {
    const string = $$.input.search.value;
    $$.span.statusSearch.textContent = string;
    const split = string.split(/\s/);
    const not = split.filter(value => value.startsWith('-'));
    const words = split.filter(value => !value.startsWith('-'));
    for (const item of document.getElementsByClassName(CLASS.card)) {
        item.classList.add(CLASS.hidden);
        if (words.every(value => item.textContent?.includes(value))) item.classList.remove(CLASS.hidden);
        if (not.some(value => item.textContent?.includes(value.replace(/^-/, '')))) item.classList.add(CLASS.hidden);
    }
}


// 読み込み時実行

Promise.all([loadData(dataSet.data), loadData(dataSet.color), loadData(dataSet.history)])
    .then(([card, color, history]) => {
        DATA.card = card;
        DATA.color = color;
        DATA.history = history;
    })
    .then(() => {
        config.addEvents();
        config.build();
        hx.render();
        render.desc();
        console.log(DATA);
    })
