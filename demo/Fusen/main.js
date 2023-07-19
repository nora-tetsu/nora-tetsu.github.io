"use strict";
import "../../common/prototype.js";
import { createDatabase } from "../../common/utilities.js";
const CLASS = {
    hidden: 'hidden',
    ellipsis: 'ellipsis',
    container: 'container',
    nav: 'nav',
    fusen: 'fusen',
    tab: 'tab',
    panel: 'panel',
    active: 'is-active',
};
const newCardStyle = {
    top: 380,
    left: 10, // 'var(--newcard-left)',
};
const hide = (elm) => elm.classList.add(CLASS.hidden);
const show = (elm) => elm.classList.remove(CLASS.hidden);
const database = createDatabase('Fusen', fetch('./sample.json').then(res => res.text()), 'array', () => Object.assign({}, Data.master));
const dragged = [];
const draggedTab = [];
const Data = (() => {
    return {
        set master(data) {
            Fusen.data = data.fusen;
            Panel.data = data.panel;
        },
        get master() {
            return {
                fusen: Fusen.data,
                panel: Panel.data,
            };
        },
        save() {
            console.groupCollapsed('Save');
            console.log(Object.assign({}, Data.master));
            database.save();
            console.groupEnd();
        },
    };
})();
const Fusen = (() => {
    let _fusen = [];
    function newFusenData(data) {
        return {
            id: data && data.id ? data.id : new Date().createNoid(),
            text: data && data.text ? data.text : '',
            top: data && data.top ? data.top : '',
            left: data && data.left ? data.left : '',
            height: data && data.height ? data.height : '',
            width: data && data.width ? data.width : '',
            panel: data && data.panel ? data.panel : Panel.activePanel,
        };
    }
    return {
        set data(data) {
            _fusen.splice(0, _fusen.length);
            _fusen.push(...data);
        },
        get data() {
            return _fusen;
        },
        add(obj) {
            const newData = newFusenData(obj);
            _fusen.push(newData);
            $panel.addFusen(newData);
            Data.save();
            return newData;
        },
        find(id) {
            return _fusen.find(data => data.id == id);
        },
        filterPanel(panelId) {
            return _fusen.filter(data => data.panel == panelId);
        },
        dupulicate(original) {
            const newData = Object.assign({}, original);
            newData.id = new Date().createNoid();
            newData.top = newCardStyle.top;
            newData.left = newCardStyle.left;
            Fusen.add(newData);
            return newData;
        },
        /** アクティブパネル上の付箋を削除 */
        deleteActivePanel() {
            const active = Panel.activePanel;
            const panel = $panel.find(active);
            panel.innerHTML = '';
            Fusen.data = _fusen.filter(data => data.panel !== active);
            Data.save();
        },
        moveToLast(data) {
            const index = _fusen.indexOf(data);
            const splice = _fusen.splice(index, 1);
            _fusen.splice(_fusen.length, 0, splice[0]);
            $panel.moveToLast(data.id);
            Data.save();
        },
    };
})();
const Panel = (() => {
    let _panel = [];
    let isActive = '';
    function newPanelData(data) {
        return {
            id: data && data.id ? data.id : new Date().createNoid(),
            name: data && data.name ? data.name : '無題',
            active: data && data.active ? data.active : false,
        };
    }
    document.body.addEventListener('keydown', (e) => {
        if (e.key == 'ArrowUp' && e.ctrlKey) {
            e.preventDefault();
            Panel.moveActiveToPrevious();
        }
        else if (e.key == 'ArrowDown' && e.ctrlKey) {
            e.preventDefault();
            Panel.moveActiveToNext();
        }
    });
    return {
        set data(data) {
            _panel.splice(0, _panel.length);
            _panel.push(...data);
            isActive = this.findActivePanel().id;
        },
        get data() {
            return _panel;
        },
        add(obj) {
            const newData = newPanelData(obj);
            _panel.push(newData);
            $panel.create(newData);
            $tab.create(newData);
            if (newData.active || _panel.length == 1)
                this.activePanel = newData.id;
            Data.save();
            return newData;
        },
        find(id) {
            return _panel.find(data => data.id == id);
        },
        findActivePanel() {
            return _panel.find(data => data.active);
        },
        deleteActivePanel() {
            Fusen.deleteActivePanel();
            const active = Panel.activePanel;
            if (_panel.length === 1) {
                Panel.add({ active: true });
                Panel.data = [Panel.data[1]];
            }
            else {
                Panel.activePanel = _panel.find(data => !data.active).id;
                Panel.data = _panel.filter(data => data.id !== active);
            }
            $panel.render();
            $tab.render();
            Data.save();
        },
        get activePanel() {
            return isActive;
        },
        set activePanel(id) {
            if (isActive == id)
                return;
            isActive = id;
            if (this.findActivePanel())
                this.findActivePanel().active = false;
            if (this.find(id))
                this.find(id).active = true;
            $tab.activate(id);
            $panel.activate(id);
            Data.save();
        },
        moveToNext(target, move) {
            const targetIndex = _panel.indexOf(target);
            const moveIndex = _panel.indexOf(move);
            const splice = _panel.splice(moveIndex, 1)[0];
            _panel.splice(targetIndex + 1, 0, splice);
            $tab.render();
            Data.save();
        },
        moveToPrevious(target, move) {
            const targetIndex = _panel.indexOf(target);
            const moveIndex = _panel.indexOf(move);
            const splice = _panel.splice(moveIndex, 1)[0];
            _panel.splice(targetIndex, 0, splice);
            $tab.render();
            Data.save();
        },
        moveActiveToNext() {
            const index = _panel.findIndex(data => data.active);
            if (!_panel[index + 1])
                return;
            this.moveToNext(_panel[index], _panel[index + 1]);
        },
        moveActiveToPrevious() {
            const index = _panel.findIndex(data => data.active);
            if (!_panel[index - 1])
                return;
            this.moveToPrevious(_panel[index], _panel[index - 1]);
        },
    };
})();
// 要素の構築
const $ROOT = document.getElementById('root');
const control = ((parent) => {
    const outer = parent.appendChild(document.createElement('nav')).addAttribute({
        class: [CLASS.nav],
    });
    const title = outer.appendChild(document.createElement('span')).addAttribute({
        textContent: '付箋ツール',
        class: ['title'],
    });
    const newFusen = outer.appendChild(document.createElement('button')).addAttribute({
        id: 'create-fusen',
        textContent: '付箋作成',
        title: 'アクティブなページに新規付箋を作成します。',
        onClick: () => {
            const newData = Fusen.add({});
            //createFusen(newData);
        }
    });
    const newPanel = outer.appendChild(document.createElement('button')).addAttribute({
        id: 'create-page',
        textContent: '新規ページ',
        title: '新しいページを作成します。',
        onClick: () => {
            Panel.add({ active: true });
        }
    });
    const clearPanel = outer.appendChild(document.createElement('button')).addAttribute({
        id: 'clear-page',
        textContent: 'ページクリア',
        title: 'アクティブなページ上にある全ての付箋を削除します。',
        onClick: () => {
            const q = confirm('表示しているページにある付箋を全て削除します。\nよろしいですか？（やり直しはできません）');
            if (!q)
                return;
            Fusen.deleteActivePanel();
        }
    });
    const deletePanel = outer.appendChild(document.createElement('button')).addAttribute({
        id: 'delete-page',
        textContent: 'ページ削除',
        title: 'アクティブなページを削除します。\n付箋のデータも失われます。',
        onClick: () => {
            const q = confirm('表示しているページを削除します。\nよろしいですか？（やり直しはできません）');
            if (!q)
                return;
            Panel.deleteActivePanel();
        }
    });
    const copy = outer.appendChild(document.createElement('button')).addAttribute({
        id: 'copy-data',
        textContent: 'コピー',
        title: '全データをjson形式でクリップボードにコピーします。',
        onClick: () => {
            JSON.stringify(Data.master, null, '\t').toClipboard();
        }
    });
})($ROOT);
const container = $ROOT.appendChild(document.createElement('div')).addAttribute({
    class: [CLASS.container],
});
const $tab = ((parent) => {
    const outer = parent.appendChild(document.createElement('ul')).addAttribute({
        id: 'tab-group',
    });
    const getTab = (id) => document.querySelector(`.${CLASS.tab}[data-id="${id}"]`);
    const getActiveTab = () => document.querySelector(`.${CLASS.tab}.${CLASS.active}`);
    function activate(id) {
        const active = getActiveTab();
        if (active)
            active.classList.remove(CLASS.active);
        const tab = getTab(id);
        if (tab)
            tab.classList.add(CLASS.active);
    }
    function render() {
        outer.innerHTML = '';
        Panel.data.forEach(data => createTab(data));
    }
    function createTab(data) {
        const tab = outer.appendChild(document.createElement('li')).addAttribute({
            'data-id': data.id,
            class: [CLASS.tab, CLASS.ellipsis],
            title: data.name + '\n（右クリックでリネーム）',
            textContent: data.name,
            draggable: true,
            onClick: () => {
                Panel.activePanel = data.id;
            },
            onContextmenu: (e) => {
                e.preventDefault();
                const p = prompt('タブ名を入力してください。', data.name);
                if (!p)
                    return;
                data.name = p;
                tab.title = p;
                tab.textContent = p;
                Data.save();
            },
            onDragstart: (e) => {
                draggedTab.splice(0, draggedTab.length);
                draggedTab.push(data);
            },
            onDragover: (e) => {
                e.preventDefault();
                if (dragged.length) {
                    tabColor('blue', 'white');
                }
                else if (draggedTab.length) {
                    const rect = tab.getBoundingClientRect();
                    if ((e.clientY - rect.top) < (rect.height / 2)) {
                        //マウスカーソルの位置が要素の半分より上
                        tabBorder('2px solid red', '');
                    }
                    else {
                        //マウスカーソルの位置が要素の半分より下
                        tabBorder('', '2px solid blue');
                    }
                }
            },
            onDragleave: () => {
                tabColor('', '');
                tabBorder('', '');
            },
            onDragend: () => {
                draggedTab.splice(0, draggedTab.length);
            },
            onDrop: (e) => {
                e.preventDefault();
                if (draggedTab.length) {
                    tabBorder('', '');
                    const rect = tab.getBoundingClientRect();
                    if ((e.clientY - rect.top) < (rect.height / 2)) {
                        //マウスカーソルの位置が要素の半分より上
                        Panel.moveToPrevious(data, draggedTab[0]);
                    }
                    else {
                        //マウスカーソルの位置が要素の半分より下
                        Panel.moveToNext(data, draggedTab[0]);
                    }
                }
            }
        });
        function tabColor(bgc, color) {
            tab.style.backgroundColor = bgc;
            tab.style.color = color;
        }
        function tabBorder(top, bottom) {
            tab.style.borderTop = top;
            tab.style.borderBottom = bottom;
        }
        if (data.active) {
            tab.classList.add(CLASS.active);
        }
        $(function () {
            $(tab).droppable({
                accept: `.${CLASS.fusen}`,
                tolerance: "pointer",
                activate: function (event, ui) {
                    $panel.position.record(ui.draggable[0]);
                },
                over: function (event, ui) {
                    tabColor('blue', 'white');
                },
                out: function (event, ui) {
                    tabColor('', '');
                },
                drop: function (event, ui) {
                    const draggedFusen = ui.draggable[0];
                    const panel = $panel.find(data.id);
                    panel.append(draggedFusen);
                    const cardId = draggedFusen.getAttribute('data-id');
                    const find = Fusen.find(cardId);
                    find.panel = data.id;
                    const pos = $panel.position.get();
                    draggedFusen.style.top = pos.top;
                    draggedFusen.style.left = pos.left;
                    $panel.position.clear();
                    tabColor('', '');
                    console.log("要素を移動しました。");
                }
            });
        });
    }
    return {
        create: createTab,
        activate: activate,
        render: render,
    };
})(container);
const $panel = ((parent) => {
    const outer = parent.appendChild(document.createElement('main'));
    const getPanel = (id) => document.querySelector(`.${CLASS.panel}[data-id="${id}"]`);
    const getActivePanel = () => document.querySelector(`.${CLASS.panel}.${CLASS.active}`);
    function activate(id) {
        const activePanel = getActivePanel();
        if (activePanel)
            activePanel.classList.remove(CLASS.active);
        const panel = getPanel(id);
        if (panel)
            panel.classList.add(CLASS.active);
    }
    function render() {
        outer.innerHTML = '';
        Panel.data.forEach(data => createPanel(data));
        Fusen.data.forEach(data => createFusen(data));
    }
    function createPanel(data) {
        const panel = outer.appendChild(document.createElement('div')).addAttribute({
            'data-id': data.id,
            class: [CLASS.panel],
        });
        if (data.active) {
            panel.classList.add(CLASS.active);
        }
    }
    function createFusen(data) {
        const style = `
            top: ${data.top};
            left: ${data.left};
            width: ${data.width};
            height: ${data.height};
        `.replace(/^\s*/g, '').replace(/\n/g, '');
        const outer = document.createElement('div').addAttribute({
            title: 'ダブルクリックで編集',
            class: [CLASS.fusen],
            draggable: true,
            'data-id': data.id,
            onDragstart: (e) => {
                dragged.splice(0, dragged.length);
                dragged.push(data);
            },
            onDragend: () => {
                dragged.splice(0, dragged.length);
            },
            onClick: (e) => {
                if (!e.altKey)
                    return;
                Fusen.moveToLast(data);
            },
            style: style,
        });
        const panel = getPanel(data.panel);
        if (!panel)
            return;
        panel.append(outer);
        const inner = outer.appendChild(document.createElement('div')).addAttribute({
            class: ['fusen-inner'],
            innerHTML: data.text.linkToHTML(),
            ondblclick: () => {
                hide(inner);
                show(textarea);
                textarea.focus();
            }
        });
        const textarea = outer.appendChild(document.createElement('textarea')).addAttribute({
            class: [CLASS.hidden],
            value: data.text,
            onblur: () => {
                if (data.text != textarea.value) {
                    data.text = textarea.value;
                    //markedText(textarea.value, inner, true);
                    inner.innerHTML = data.text.linkToHTML();
                    Data.save();
                }
                hide(textarea);
                show(inner);
            },
        });
        $(function () {
            $(outer).draggable({
                stop: function (e, ui) {
                    data.top = ui.position.top;
                    data.left = ui.position.left;
                    Data.save();
                }
            });
            $(outer).resizable({
                stop: function (e, ui) {
                    data.width = ui.size.width;
                    data.height = ui.size.height;
                    Data.save();
                }
            });
        });
    }
    const draggedFusenPosition = { top: '', left: '' };
    function recordPosition(elm) {
        draggedFusenPosition.top = elm.style.top;
        draggedFusenPosition.left = elm.style.left;
    }
    function clearPosition() {
        draggedFusenPosition.top = "";
        draggedFusenPosition.left = "";
    }
    function getPosition() {
        return Object.assign({}, draggedFusenPosition);
    }
    return {
        create: createPanel,
        activate: activate,
        render: render,
        find: getPanel,
        addFusen: createFusen,
        findFusen: (id) => {
            return document.querySelector(`.${CLASS.fusen}[data-id="${id}"]`);
        },
        position: {
            record: recordPosition,
            clear: clearPosition,
            get: getPosition,
        },
        moveToLast(id) {
            const item = $panel.findFusen(id);
            getActivePanel().append(item);
        },
    };
})(container);
// 読み込み時実行
Promise.all([database.load()]) // 機能追加の可能性を踏まえて敢えてPromise.allを使っています。
    .then(([data]) => {
    Data.master = data;
})
    .then(() => {
    console.group('Loading...');
    $tab.render();
    $panel.render();
})
    .then(() => {
    console.log(Object.assign({}, Data.master));
    console.log('Done');
    console.groupEnd();
});