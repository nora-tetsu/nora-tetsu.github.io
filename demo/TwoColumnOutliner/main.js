"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _OutlineLi_instances, _OutlineLi_setFocus;
import "../../common/prototype.js";
/* サンプルでは省略した要素
- リンク（note欄のダブルブラケット）
- 出典・URLがある時にノード端にアイコン生成
- markdown、Scrapboxへの変換
- 検索
*/
// 汎用
const $ = (id) => document.getElementById(id);
const getSelector = (key, value) => `[${key}="${value}"]`;
const getNoidSelector = (value) => getSelector('noid', value);
const hyde = (elm) => elm.classList.add(CLASS.hidden);
const show = (elm) => elm.classList.remove(CLASS.hidden);
const toggle = (elm) => elm.classList.toggle(CLASS.hidden);
const loadData = (dataType) => {
    if (!localStorage.hasOwnProperty(dataType.name) || !localStorage.getItem(dataType.name)) { // 初回のみ発動
        return dataType.default.then(data => {
            localStorage.setItem(dataType.name, data);
            return dataType.type == 'string' ? data : JSON.parse(data);
        });
    }
    else {
        const data = localStorage.getItem(dataType.name);
        return new Promise((resolve) => resolve(dataType.type == 'string' ? data : JSON.parse(data)));
    }
};
const saveData = (dataType) => localStorage.setItem(dataType.name, JSON.stringify(dataType.data));
const dataSet = {
    data: {
        name: 'TwoColumnOutliner',
        default: fetch('./sample.json').then(res => res.text()),
        type: 'array',
        get data() { return operate.data.slice(); },
    },
    color: {
        name: 'Color',
        default: fetch('../../common/color.json').then(res => res.text()),
        type: 'array',
        get data() { return operate.color.slice(); },
    },
};
const operate = {
    keys: ["noid", "attr", "text", "whose", "url", "note", "isCollapsed", 'parent'],
    color: [],
    _data: [],
    set data(DATA) {
        if (!DATA.length) {
            const obj = {
                noid: new Date().createNoid(),
                attr: '',
                text: '',
                whose: '',
                url: '',
                note: '',
                parent: '',
                isCollapsed: false,
            };
            DATA.push(obj);
        }
        this._data = DATA;
    },
    get data() {
        return this._data;
    },
    addItem(data) {
        this.data.push(data);
    },
    resetFromHtml(li) {
        this.data = convert.htmlToDataArr();
        history.set();
        if (li)
            render.reflesh(li);
    },
    save(DATA, shouldRender = true, shouldUpdate = true) {
        if (shouldUpdate)
            this.data = DATA;
        if (shouldRender)
            render.all();
        attribute.reset();
        saveData(dataSet.data);
    },
    findItem(noid) {
        return this.data.find(data => data.noid == noid);
    },
    findIndex(noid) {
        return this.data.findIndex(data => data.noid == noid);
    },
    spliceItem(noid) {
        return this.data.splice(this.findIndex(noid), 1)[0];
    },
    insertItem(index, data) {
        this.data.splice(index, 0, data);
    },
    pickupByParent(parentNoid) {
        return this.data.filter(data => data.parent == parentNoid);
    },
};
const history = {
    DATA: [],
    current: -1,
    set(shouldRender = false) {
        if (JSON.stringify(this.DATA[this.current]) == JSON.stringify(operate.data))
            return;
        const current = JSON.parse(JSON.stringify(operate.data)); // 参照を切るため
        this.DATA.splice(this.current + 1, this.DATA.length, current);
        this.current++;
        operate.save(undefined, shouldRender, false);
    },
    undo() {
        if (this.current <= 0)
            return;
        console.log('undo');
        operate.save(this.DATA[this.current - 1]);
        this.current--;
    },
    redo() {
        if (this.current >= this.DATA.length - 1)
            return;
        console.log('redo');
        operate.save(this.DATA[this.current + 1]);
        this.current++;
    },
};
const convert = {
    opmlToOutlines(opml) {
        const mount = document.createElement('div').addAttribute({
            innerHTML: opml,
        });
        return Array.from(mount.getElementsByTagName('outline'));
    },
    outlineToDatatype(elm) {
        const obj = {};
        for (const key of operate.keys) {
            key == 'isCollapsed' ? obj[key] = elm.getAttribute(key) == "true" ? true : false
                : key == 'parent' ? obj[key] == elm.parentElement.getAttribute('noid') || ''
                    : obj[key] = elm.getAttribute(key) || '';
        }
        return obj;
    },
    datatypeToOutline(data) {
        const outline = document.createElement('outline');
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                if (!data[key])
                    continue;
                const value = (typeof data[key] == 'string' ? data[key] : data[key].toString());
                outline.setAttribute(key, value);
            }
        }
        return outline;
    },
    opmlToData(outlines, DATA) {
        for (const outline of outlines) {
            const parent = outline.parentElement;
            const parentNoid = parent ? parent.getAttribute('noid') : '';
            const data = convert.outlineToDatatype(outline);
            data.parent = parentNoid;
            DATA.push(data);
        }
    },
    dataToOpml(DATA) {
        const mount = document.createElement('div');
        for (const data of DATA) {
            const outline = convert.datatypeToOutline(data);
            if (data.parent) {
                mount.querySelector(getNoidSelector(data.parent)).append(outline);
            }
            else {
                mount.append(outline);
            }
        }
        return mount.innerHTML;
    },
    htmlToDataArr() {
        const result = [];
        const nodes = OutlineLi.getInstances('', $ulistMain);
        for (const node of nodes) {
            result.push(node.getData());
        }
        return result;
    },
    dataToHtml(DATA, ulist, parent) {
        ulist.innerHTML = '';
        if (!parent) {
            for (const data of DATA) {
                const outline = new OutlineLi(data, ulist);
                if (!outline.parent) {
                    ulist.append(outline);
                }
                else {
                    const node = OutlineLi.getInstanceByNoid(ulist, outline.parent);
                    node.list.append(outline);
                }
            }
        }
        else {
            const children = DATA.filter(data => data.parent == parent);
            if (!children.length)
                return;
            for (const data of children) {
                const outline = new OutlineLi(data, ulist);
                ulist.append(outline);
                loopRenderChild(outline);
            }
        }
        function loopRenderChild(node) {
            const filter = DATA.filter(data => data.parent == node.noid);
            if (!filter.length)
                return;
            for (const data of filter) {
                const outline = new OutlineLi(data, ulist);
                node.list.append(outline);
                loopRenderChild(outline);
            }
        }
    }
};
// 定数・設定類
const CLASS = {
    hidden: 'hidden',
    darkColor: 'bg-dark',
    column: 'column',
    columnLeft: 'column-left',
    columnRight: 'column-right',
    list: 'list',
    onfocus: 'onfocus',
};
// class
const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            const target = mutation.target;
            if (target.querySelector('li')) {
                target.parentElement.classList.add('hasChild');
            }
            else {
                target.parentElement.classList.remove('hasChild');
            }
        }
    }
});
const observe = (list) => observer.observe(list, { childList: true });
const IS = {
    OutlineLi: 'outline-li',
};
class OutlineLi extends HTMLLIElement {
    constructor(data, ulist, renderer) {
        super();
        _OutlineLi_instances.add(this);
        this.noid = new Date().createNoid();
        this.container = document.createElement('div').addAttribute({
            draggable: 'true',
            onDragstart: (e) => {
                OutlineLi.drag.splice(0, OutlineLi.drag.length - 1, this.findData());
                e.dataTransfer.setData('text/plain', this.text);
            },
            onDragover: (e) => {
                e.preventDefault();
                let parent = this.parent;
                while (parent) {
                    if (parent == OutlineLi.drag[0].noid) {
                        e.dataTransfer.dropEffect = "none";
                        return;
                    }
                    parent = operate.findItem(parent).parent;
                }
                /*
                if (this.closest(getNoidSelector(OutlineLi.drag[0].noid))) {
                    e.dataTransfer.dropEffect = "none";
                    return;
                }
                */
                const rect = this.getBoundingClientRect();
                if ((e.clientY - rect.top) < (rect.height / 2)) {
                    //マウスカーソルの位置が要素の半分より上
                    this.style.borderTop = '2px solid red';
                    this.style.borderBottom = '';
                }
                else if ((e.clientX - rect.left) > (rect.width / 4)) {
                    //マウスカーソルの位置が要素の半分より下かつ右3/4の範囲
                    this.style.borderTop = '';
                    this.style.borderBottom = '2px dotted blue';
                }
                else {
                    //マウスカーソルの位置が要素の半分より下かつ左1/4の範囲
                    this.style.borderTop = '';
                    this.style.borderBottom = '2px solid blue';
                }
            },
            onDragleave: () => {
                this.style.borderTop = '';
                this.style.borderBottom = '';
            },
            onDrop: (e) => {
                e.preventDefault();
                this.style.borderTop = '';
                this.style.borderBottom = '';
                const index = operate.findIndex(this.noid);
                const splice = operate.spliceItem(OutlineLi.drag[0].noid);
                const rect = this.getBoundingClientRect();
                if ((e.clientY - rect.top) < (rect.height / 2)) {
                    //マウスカーソルの位置が要素の半分より上
                    splice.parent = this.parent;
                    operate.insertItem(index, splice);
                }
                else if ((e.clientX - rect.left) > (rect.width / 4)) {
                    //マウスカーソルの位置が要素の半分より下かつ右3/4の範囲
                    splice.parent = this.noid;
                    const children = operate.pickupByParent(this.noid);
                    if (children.length) {
                        const lastChildIndex = operate.findIndex(children[children.length - 1].noid);
                        operate.insertItem(lastChildIndex, splice);
                    }
                    else {
                        operate.insertItem(index + 1, splice);
                    }
                }
                else {
                    //マウスカーソルの位置が要素の半分より下かつ左1/4の範囲
                    splice.parent = this.parent;
                    operate.insertItem(index + 1, splice);
                }
                history.set(true);
                console.log('set(drop)');
            }
        });
        this.focusIcon = document.createElement('i').addAttribute({
            class: ['focus-icon', 'fas', 'fa-search-plus'],
            title: 'フォーカス',
            onClick: () => {
                if (focus.noid == this.noid) {
                    focus.clear();
                }
                else {
                    focus.set(this.noid);
                }
            },
        });
        this.nodeIcon = document.createElement('i').addAttribute({
            class: ['node-icon', 'fas', 'fa-caret-down'],
            title: '子項目を開閉',
            onClick: () => this.toggleCollapse(),
        });
        this.content = document.createElement('span').addAttribute({
            contenteditable: 'true',
            onBlur: () => {
                // Enter時にエラーが出るため処理を遅らせる
                setTimeout(() => {
                    if (!this.findData())
                        return;
                    if (this.findData().text == this.text)
                        return;
                    this.findData().text = this.text;
                    const nodes = OutlineLi.getAllInstancesByNoid(this.noid);
                    for (const node of nodes) {
                        if (node != this)
                            node.text = this.text;
                    }
                    history.set();
                    console.log('set(blur)');
                }, 10);
            },
            onKeydown: (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const newNoid = new Date().createNoid();
                    for (const node of OutlineLi.getAllInstancesByNoid(this.noid)) {
                        const item = new OutlineLi({ noid: newNoid, parent: this.parent }, this.ulist);
                        if (!e.shiftKey) {
                            node.after(item);
                        }
                        else {
                            node.before(item);
                        }
                    }
                    operate.resetFromHtml(this);
                    OutlineLi.focus(newNoid, this.ulist);
                    return;
                }
                else if (e.key === 'Tab' && !e.shiftKey) {
                    e.preventDefault();
                    for (const node of OutlineLi.getAllInstancesByNoid(this.noid)) {
                        const previous = node.previousElementSibling;
                        if (!previous)
                            return;
                        previous.list.append(node);
                        node.parent = previous.noid;
                    }
                    operate.resetFromHtml(this);
                    OutlineLi.focus(this.noid, this.ulist);
                    return;
                }
                else if (e.key === 'Tab' && e.shiftKey) {
                    e.preventDefault();
                    if (this.parentElement == $ulistMain || this.parentElement == $ulistFocus)
                        return;
                    for (const node of OutlineLi.getAllInstancesByNoid(this.noid)) {
                        const parent = node.parentElement.closest(`li${getSelector('is', IS.OutlineLi)}`);
                        if (parent) {
                            parent.after(node);
                            node.parent = parent.parent;
                        }
                        else {
                            node.remove();
                        }
                    }
                    operate.resetFromHtml(this);
                    OutlineLi.focus(this.noid, this.ulist);
                    return;
                }
                else if (e.key === 'ArrowDown' && (e.ctrlKey || e.altKey)) {
                    e.preventDefault();
                    for (const node of OutlineLi.getAllInstancesByNoid(this.noid)) {
                        if (node == node.parentElement.lastElementChild)
                            return;
                        node.nextElementSibling.after(node);
                    }
                    operate.resetFromHtml(this);
                    OutlineLi.focus(this.noid, this.ulist);
                    return;
                }
                else if (e.key === 'ArrowUp' && (e.ctrlKey || e.altKey)) {
                    e.preventDefault();
                    for (const node of OutlineLi.getAllInstancesByNoid(this.noid)) {
                        const previous = node.previousElementSibling;
                        if (!previous)
                            return;
                        previous.before(node);
                    }
                    operate.resetFromHtml(this);
                    OutlineLi.focus(this.noid, this.ulist);
                    return;
                }
                else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    __classPrivateFieldGet(this, _OutlineLi_instances, "m", _OutlineLi_setFocus).call(this, 'next');
                    return;
                }
                else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    __classPrivateFieldGet(this, _OutlineLi_instances, "m", _OutlineLi_setFocus).call(this, 'previous');
                    return;
                }
                else if (e.key === 'Backspace' && e.ctrlKey && e.shiftKey) {
                    e.preventDefault();
                    __classPrivateFieldGet(this, _OutlineLi_instances, "m", _OutlineLi_setFocus).call(this, 'next');
                    const newNoid = new Date().createNoid();
                    for (const node of OutlineLi.getAllInstancesByNoid(this.noid)) {
                        node.remove();
                        if (this.ulist.childElementCount == 0) {
                            new OutlineLi({ noid: newNoid }, this.ulist);
                        }
                        ;
                    }
                    operate.resetFromHtml(this);
                    return;
                }
            },
            onPaste: (e) => {
                e.preventDefault();
                const value = e.clipboardData.getData('text');
                if (!value)
                    return;
                const selection = window.getSelection();
                const range = selection.getRangeAt(0);
                const node = document.createTextNode(value);
                range.deleteContents();
                range.insertNode(node);
                range.setStartAfter(node);
                range.setEndAfter(node);
                selection.removeAllRanges();
                selection.addRange(range);
            },
        });
        this.list = document.createElement('ul');
        this.attr = '';
        this.whose = '';
        this.url = '';
        this.note = '';
        this.parent = '';
        this.isCollapsed = false;
        this.append(this.container, this.list);
        this.container.append(this.focusIcon, this.nodeIcon, this.content);
        if (data) {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    this[key] = data[key];
                }
            }
        }
        if (ulist) {
            if (data && data.parent) {
                const parent = OutlineLi.getInstanceByNoid(ulist, data.parent);
                if (parent) {
                    parent.list.append(this);
                }
                else {
                    ulist.append(this);
                }
            }
            else {
                ulist.append(this);
            }
            this.ulist = ulist;
        }
        ;
        if (renderer)
            renderer(this);
        this.addAttribute({
            is: IS.OutlineLi,
            'data-attr': this.attr,
        });
        if (this.isCollapsed) {
            this.isCollapsed = false;
            this.toggleCollapse();
        }
        ;
        observe(this.list);
        this.content.focus();
        //console.log("新規ノード（" + this.noid + "）を作成しました。");
    }
    get text() { return this.content.textContent; }
    ;
    set text(str) { this.content.textContent = str; }
    ;
    toggleCollapse() {
        toggle(this.list);
        this.nodeIcon.classList.toggle('fa-caret-right');
        this.nodeIcon.classList.toggle('fa-caret-down');
        this.isCollapsed = this.isCollapsed ? false : true;
        if (!this.findData())
            return;
        this.findData().isCollapsed = this.isCollapsed;
    }
    setAttr(key, value) {
        this[key] = value;
        this.setAttribute(`data-${key}`, value.toString());
    }
    findData() {
        return operate.findItem(this.noid);
    }
    ;
    getData() {
        return {
            noid: this.noid,
            attr: this.attr,
            text: this.text,
            whose: this.whose,
            url: this.url,
            note: this.note,
            parent: this.parent,
            isCollapsed: this.isCollapsed,
        };
    }
    static focus(noid, ulist) {
        OutlineLi.getInstanceByNoid(ulist, noid).content.focus();
    }
    static getInstances(query, ulist) {
        const parent = ulist || document;
        return Array.from(parent.querySelectorAll(`li${getSelector('is', IS.OutlineLi)}${query || ''}`));
    }
    static getInstanceByNoid(ulist, noid) {
        return OutlineLi.getInstances('', ulist).find(li => li.noid == noid);
    }
    static getAllInstancesByNoid(noid) {
        return OutlineLi.getInstances().filter(li => li.noid == noid);
    }
}
_OutlineLi_instances = new WeakSet(), _OutlineLi_setFocus = function _OutlineLi_setFocus(which) {
    const instances = OutlineLi.getInstances('', this.ulist);
    if ((which == 'previous' && this == instances[0]) || (which == 'next' && this == instances[instances.length - 1]))
        return;
    const visible = instances.filter(elm => !elm.closest('ul.hidden'));
    const index = visible.indexOf(this);
    const targetIndex = which == 'previous' ? index - 1 : index + 1;
    visible[targetIndex].content.focus();
};
OutlineLi.drag = [];
customElements.define(IS.OutlineLi, OutlineLi, { extends: 'li' });
const focus = {
    set noid(noid) {
        $ulistFocus.setAttribute('data-noid', noid);
    },
    get noid() {
        return $ulistFocus.getAttribute('data-noid');
    },
    set(noid) {
        attribute.set(operate.findItem(noid));
        focus.noid = noid;
        render.focus();
        const textarea = $attributes.getElementsByTagName('textarea');
        for (const area of Array.from(textarea)) {
            area.removeAttribute('disabled');
        }
    },
    clear() {
        focus.noid = '';
        $('attr-noid').textContent = '';
        $('attr-parent').textContent = '';
        const textarea = $attributes.getElementsByTagName('textarea');
        for (const area of Array.from(textarea)) {
            area.value = '';
            area.setAttribute('disabled', '');
        }
        for (const node of Array.from($ulistMain.querySelectorAll(`.${CLASS.onfocus}`))) {
            node.classList.remove(CLASS.onfocus);
        }
        $ulistFocus.innerHTML = '';
    },
};
const attribute = {
    get() {
        const result = {};
        for (const key of operate.keys) {
            if (key == 'parent' || key == 'isCollapsed')
                continue;
            if (key == 'noid') {
                const target = $(`attr-${key}`);
                result[key] = target.textContent;
            }
            else {
                const target = $(`attr-${key}`);
                result[key] = target.value;
            }
        }
        return result;
    },
    update() {
        const attr = attribute.get();
        if (!attr.noid)
            return;
        const find = operate.findItem(attr.noid);
        if (!find)
            return;
        let isChanged = false;
        for (const key in attr) {
            if (key == 'noid')
                continue;
            if (Object.prototype.hasOwnProperty.call(attr, key)) {
                if (find[key] == attr[key])
                    continue;
                find[key] = attr[key];
                isChanged = true;
            }
        }
        if (isChanged) {
            history.set();
            console.log('set(attr)');
            render.all(); // liに反映させるため
        }
    },
    set(data) {
        for (const key of operate.keys) {
            if (key == 'isCollapsed')
                continue;
            if (key == 'noid' || key == 'parent') {
                const target = $(`attr-${key}`);
                target.textContent = data[key] || '';
            }
            else {
                const target = $(`attr-${key}`);
                target.value = data[key] ? data[key].toString() : '';
            }
        }
    },
    reset() {
        if (!focus.noid)
            return;
        const find = operate.findItem(focus.noid);
        if (!find)
            return;
        attribute.set(find);
    },
};
// 要素の構築
const $ROOT = $('root');
const $MAIN = $ROOT.appendChild(document.createElement('main'));
const $columnLeft = $MAIN.appendChild(document.createElement('div')).addAttribute({
    class: [CLASS.column, CLASS.columnLeft],
});
const $headingMain = $columnLeft.appendChild(document.createElement('h1')).addAttribute({
    class: [CLASS.darkColor],
    textContent: 'Main',
});
const $ulistMain = $columnLeft.appendChild(document.createElement('ul')).addAttribute({
    id: 'content',
    class: [CLASS.list],
});
const $columnRight = $MAIN.appendChild(document.createElement('div')).addAttribute({
    class: [CLASS.column, CLASS.columnRight],
});
const $headingFocus = $columnRight.appendChild(document.createElement('h1')).addAttribute({
    class: [CLASS.darkColor],
    textContent: 'Focus',
    title: '各ノードのフォーカスアイコンクリックで詳細を表示'
});
const $attributes = (() => {
    const wrapper = $columnRight.appendChild(document.createElement('div')).addAttribute({
        id: 'attributes',
    });
    const createItem = (key) => {
        const outer = wrapper.appendChild(document.createElement('div'));
        outer.appendChild(document.createElement('span')).addAttribute({
            textContent: key,
        });
        if (key == 'noid' || key == 'parent') {
            const area = outer.appendChild(document.createElement('span')).addAttribute({
                id: `attr-${key}`,
                title: key == 'noid' ? 'このノードのID' : 'クリックで親ノードをフォーカス',
            });
            if (key == 'parent')
                area.onclick = () => focus.set(area.textContent);
        }
        else {
            outer.appendChild(document.createElement('textarea')).addAttribute({
                id: `attr-${key}`,
                rows: key == 'text' || key == 'note' ? 2 : 1,
                onBlur: attribute.update,
                title: key == 'attr' ? '/薄赤/ などと書くとノードの背景色が変わります'
                    : key == 'text' ? 'アウトライン上に表示される文字列です'
                        : key == 'whose' ? '誰かの言葉の引用の時は名前を書きます\n（アウトライン上で確認できる機能を当初作っていましたが\nこのサンプルでは省略しています）'
                            : key == 'url' ? '関連するURLがあれば記入します\n（アウトライン上からリンク先を開く機能を当初作っていましたが\nこのサンプルでは省略しています）'
                                : 'その他のメモ欄です',
                disabled: '',
            });
        }
    };
    createItem('noid');
    createItem('parent');
    for (const key of operate.keys) {
        if (key == 'isCollapsed' || key == 'noid' || key == 'parent')
            continue;
        createItem(key);
    }
    /*
    const button = wrapper.appendChild(document.createElement('button')).addAttribute({
        id: 'update-attr',
        textContent: '更新',
        onClick: attr.update,
    })
    */
    return wrapper;
})();
const $ulistFocus = $columnRight.appendChild(document.createElement('ul')).addAttribute({
    id: 'focus',
    class: [CLASS.list],
});
const render = {
    all() {
        this.main();
        this.focus();
    },
    main() {
        convert.dataToHtml(operate.data, $ulistMain);
    },
    focus() {
        if (!focus.noid)
            return;
        for (const node of Array.from($ulistMain.querySelectorAll(`.${CLASS.onfocus}`))) {
            node.classList.remove(CLASS.onfocus);
        }
        convert.dataToHtml(operate.data, $ulistFocus, focus.noid);
        OutlineLi.getInstanceByNoid($ulistMain, focus.noid).classList.add(CLASS.onfocus);
    },
    reflesh(li) {
        if ($ulistMain.contains(li)) {
            render.focus();
        }
        else if ($ulistFocus.contains(li)) {
            render.main();
        }
    }
};
const $$Debug = $ROOT.appendChild(document.createElement('div')).addAttribute({
    class: 'debug',
});
//$$Debug.appendChild(createButton('console.log(operate.data)', () => console.log(operate.data)));
//$$Debug.appendChild(createButton('console.log(OutlineLi.drag)', () => console.log(OutlineLi.drag)));
//$$Debug.appendChild(createButton('console.log(opml)', () => console.log(convert.dataToOpml(operate.data))));
$$Debug.appendChild(createButton('undo', () => history.undo()));
$$Debug.appendChild(createButton('redo', () => history.redo()));
//$$Debug.appendChild(createButton('console.log(history)', () => console.log(history)));
function createButton(display, onClick, tooltip) {
    return document.createElement('button').addAttribute({
        textContent: display,
        onClick: onClick,
        title: tooltip || '',
    });
}
function setColorStyle(colorData) {
    const style = document.body.appendChild(document.createElement('style'));
    for (const data of colorData) {
        let color = '';
        switch (data.name) {
            case '赤':
            case '青':
            case '緑':
            case '紫':
                color = '\n    color: #fff;\n';
                break;
            default:
        }
        const str = `
li[data-attr*="/${data.name}/"] > div span {
    background-color: ${data.code};${color}
}`;
        style.textContent += str;
    }
}
// 読み込み時実行
Promise.all([loadData(dataSet.data), loadData(dataSet.color)])
    .then(([outline, color]) => {
    operate.data = outline;
    //opmlToArray(convert.opmlToOutlines(outline || convert.datatypeToOutline({ noid: new Date().createNoid() }).outerHTML), DATA);
    operate.color = color;
})
    .then(() => {
    history.set();
    console.log('set(load)');
    setColorStyle(operate.color);
})
    .then(() => {
    convert.dataToHtml(operate.data, $ulistMain);
    console.log(operate.data);
});
//# sourceMappingURL=main.js.map