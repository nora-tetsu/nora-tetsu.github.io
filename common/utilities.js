import "./prototype.js";
const CLASS = {
    hidden: 'hidden',
};
// 汎用
export const $ = (id) => document.getElementById(id);
export const getSelector = (key, value) => `[${key}="${value}"]`;
// const getNoidSelector = (value: string) => getSelector('noid', value);
export const hyde = (elm) => elm.classList.add(CLASS.hidden);
export const show = (elm) => elm.classList.remove(CLASS.hidden);
export const toggle = (elm) => elm.classList.toggle(CLASS.hidden);
export const loadData = (dataType) => {
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
export const saveData = (dataType) => localStorage.setItem(dataType.name, JSON.stringify(dataType.data));
// 改良版
/**
 * localStorageでデータを管理する
 * @param name localStorageのキー名
 * @param defaultData ex) fetch('./sample.json').then(res => res.text())
 * @param type 'string' | 'array' | 'object'
 * @param data ex) () => Object.assign({}, DATA)
 * @returns
 */
export const createDatabase = (name, defaultData, type, data) => {
    const obj = {
        name: name,
        default: defaultData,
        type: type,
        get data() { return data(); },
    };
    return {
        load: () => loadData(obj),
        save: () => saveData(obj),
    };
};
// DOM生成
export function createButton(display, onClick, tooltip) {
    return document.createElement('button').addAttribute({
        textContent: display,
        onClick: onClick,
        title: tooltip || '',
    });
}
//# sourceMappingURL=utilities.js.map