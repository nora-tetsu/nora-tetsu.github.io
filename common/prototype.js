String.prototype.toClipboard = function () {
    const txt = this.toString();
    navigator.clipboard.writeText(txt)
        .then(() => {
        //console.log("Text copied to clipboard...")
        console.group('Copied to clipboard');
        console.log(txt.length < 100 ? txt : txt.slice(0, 100) + '…');
        console.groupEnd();
    })
        .catch(err => {
        console.log('Something went wrong', err);
    });
    return this;
};
String.prototype.linkToHTML = function () {
    let text = this.toString();
    const arr = [
        {
            regexp: /\[([^\]]+)\]\(((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))\)/g,
            func(match, title, url, h, href) { return `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`; },
        },
        {
            regexp: /\[([^\]]+) ((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))\]/g,
            func(match, title, url, h, href) { return `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`; },
        },
        {
            regexp: /\[((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+)) ([^\]]+)\]/g,
            func(match, url, h, href, title) { return `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`; },
        },
        {
            regexp: /\[((h?)(ttps?:\/\/gyazo.com\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))\]/g,
            func(match, url, h, href) { return `<img src="${url}/raw">`; },
        },
        {
            regexp: /\[((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))\]/g,
            func(match, url, h, href) { return `<img src="${url}">`; },
        },
    ];
    for (const obj of arr) {
        text = text.replace(obj.regexp, obj.func);
    }
    return text;
};
const DIVISOR = 1000 * 60 * 60 * 24; // =86400000 ミリ秒から日数にする
// https://opentechnica.blogspot.com/2012/03/javascript.html
Date.prototype.getDayOfYear = function () {
    const firstDay = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((this.getTime() - firstDay.getTime()) / DIVISOR);
};
Date.prototype.getWeekOfYear = function () {
    const firstDay = new Date(this.getFullYear(), 0, 1);
    const offset = firstDay.getDay() - 1;
    const weeks = Math.floor((this.getDayOfYear() + offset) / 7);
    return (firstDay.getDay() == 0) ? weeks + 1 : weeks;
};
Date.prototype.getDataObject = function () {
    return {
        yyyy: this.getFullYear(),
        yy: this.getFullYear().toString().slice(-2),
        m: this.getMonth() + 1,
        mm: ('00' + (this.getMonth() + 1)).slice(-2),
        d: this.getDate(),
        dd: ('00' + this.getDate()).slice(-2),
        h: this.getHours(),
        hh: ('00' + this.getHours()).slice(-2),
        n: this.getMinutes(),
        nn: ('00' + this.getMinutes()).slice(-2),
        s: this.getSeconds(),
        ss: ('00' + this.getSeconds()).slice(-2),
        day: this.getDay(),
    };
};
Date.prototype.createNoid = function () {
    const str = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    const { yy, m, d, h, n, s } = this.getDataObject();
    return str[Number(yy)] + str[m - 1] + str[d] + str[h] + str[n] + str[s] + this.getMilliseconds();
};
Date.prototype.format = function (format = 'yyyy-mm-ddThh:nn') {
    const { yyyy, yy, mm, m, dd, d, hh, h, nn, n, ss, s } = this.getDataObject();
    return format.replace('yyyy', yyyy.toString()).replace('yy', yy)
        .replace('mm', mm).replace('m', m.toString())
        .replace('dd', dd).replace('d', d.toString())
        .replace('hh', hh).replace('h', h.toString())
        .replace('nn', nn).replace('n', n.toString())
        .replace('ss', ss).replace('s', s.toString())
        .replace('年月日', `${yyyy}年${m}月${d}日`)
        .replace('時分', `${h}時${n}分`);
};
HTMLElement.prototype.addAttribute = function (obj) {
    const elm = this; // 型チェックのエラー回避のため
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const element = obj[key];
            key == 'id' || key == 'textContent' || key == 'innerHTML' || key == 'innerText' || key == 'className' || key == 'value' ? elm[key] = element
                : key == 'class' && typeof obj[key] == 'string' ? elm.classList.add(element)
                    : key == 'class' && typeof obj[key] == 'object' ? elm.classList.add(...element)
                        : key.startsWith('on') ? elm.addEventListener(key.toLocaleLowerCase().replace(/^on/, ''), element)
                            : elm.setAttribute(key, element);
        }
    }
    return elm;
};
HTMLDataListElement.prototype.createOptions = function (arr, key = 'name') {
    this.innerHTML = '';
    const result = [];
    if (typeof arr[0] == 'string') {
        for (const data of arr) {
            const find = result.find(obj => obj === data);
            if (find) {
                find.count++;
            }
            else {
                result.push({
                    [key]: data,
                    count: 1,
                });
            }
        }
    }
    else {
        for (const data of arr) {
            const find = result.find(obj => obj[key] === data[key]);
            if (find) {
                find.count++;
            }
            else {
                result.push({
                    [key]: data[key],
                    count: 1,
                });
            }
        }
    }
    result.sort((a, b) => b.count - a.count);
    for (const data of result) {
        const opt = document.createElement('option');
        opt.value = data[key];
        opt.innerText = data[key];
        this.append(opt);
    }
};
export {};
//# sourceMappingURL=prototype.js.map