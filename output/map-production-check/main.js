import { createApp, h, ref } from 'vue';
import MapApp from '../../modules/xiaobai-os/apps/map/ui/MapApp.vue';
import AppNavigationScope from '../../modules/xiaobai-os/shell/app-src/components/AppNavigationScope.vue';
import fixtures from 'check:fixtures';
import './preview.css';

const initial = key => ({ chatIdentity: 'test:' + key, map: structuredClone(fixtures[key]), status: 'ready', writeState: 'ready', message: '', autoMaintenance: false });
let listener;
const requests = [];
const startKey = new URL(location.href).searchParams.get('scene') || 'cabin';
let current = initial(startKey);
if (new URL(location.href).searchParams.has('loading')) {current = { ...current, map: null, status: 'loading' };}
const bridge = { subscribe(fn) { listener = fn; return () => { listener = undefined; }; }, request(endpoint) { requests.push(endpoint); return Promise.resolve({ result: current }); } };
createApp({ setup() {
    const key = ref(startKey), version = ref(0), dark = ref(false), shown = ref(true);
    const nav = ref();
    const reopen = () => { current = initial(key.value); version.value++; };
    window.mapCheck = {
        requests,
        push(map, extra = {}) {current = { ...current, map, ...extra }; listener?.({ type: 'map/state', payload: { state: current } });},
        map: () => structuredClone(current.map),
        fixture: key => structuredClone(fixtures[key]),
        reopen, back: () => nav.value?.back(),
        unmount: () => {shown.value = false;}, mount: () => {shown.value = true;},
    };
    return () => h('div', { class: dark.value ? 'preview theme-dark' : 'preview' }, [
        h('header', { class: 'check-controls' }, [
            h('select', { 'aria-label': '测试场景', value: key.value, onChange: e => {key.value = e.target.value; reopen();} }, Object.keys(fixtures).map(id => h('option', { value: id }, id))),
            h('button', { onClick: () => {dark.value = !dark.value;} }, '主题'),
            h('button', { onClick: reopen }, '重新打开'),
            h('button', { onClick: () => nav.value?.back() }, '返回'),
        ]),
        h('div', { class: 'device' }, shown.value ? h(AppNavigationScope, { ref: nav, owner: String(version.value) }, { default: () => h(MapApp, { key: version.value, bridge, initialState: current }) }) : []),
    ]);
} }).mount('#app');
