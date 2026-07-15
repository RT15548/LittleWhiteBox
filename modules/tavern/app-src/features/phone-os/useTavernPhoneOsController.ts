import { computed, ref, watch, type Ref } from 'vue';
import { getTavernPhoneApp, listTavernPhoneApps } from './phone-os-app-registry';
import {
    createTavernPhoneAppRoute,
    createTavernPhoneHomeRoute,
    type TavernPhoneOsRoute,
} from './phone-os-types';
import { useTavernPhoneViewport } from './useTavernPhoneViewport';

export interface TavernPhoneOsControllerOptions {
    selectedSessionId: Ref<string>;
}

function appRoutesMatch(left: TavernPhoneOsRoute, right: TavernPhoneOsRoute): boolean {
    if (left.kind !== 'app' || right.kind !== 'app') {return left.kind === right.kind;}
    if (left.appId !== right.appId || left.path !== right.path) {return false;}
    const leftParams = Object.entries(left.params || {}).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
    const rightParams = Object.entries(right.params || {}).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
    return JSON.stringify(leftParams) === JSON.stringify(rightParams);
}

export function useTavernPhoneOsController(options: TavernPhoneOsControllerOptions) {
    const isOpen = ref(false);
    const routeStack = ref<TavernPhoneOsRoute[]>([createTavernPhoneHomeRoute()]);
    const transitionDirection = ref<'forward' | 'back' | 'home'>('forward');
    const viewport = useTavernPhoneViewport();
    const apps = listTavernPhoneApps();

    const activeRoute = computed<TavernPhoneOsRoute>(() => (
        routeStack.value.at(-1) || createTavernPhoneHomeRoute()
    ));
    const activeApp = computed(() => (
        activeRoute.value.kind === 'app'
            ? getTavernPhoneApp(activeRoute.value.appId)
            : null
    ));
    const isHome = computed(() => activeRoute.value.kind === 'home');

    function replaceWithHome() {
        routeStack.value = [createTavernPhoneHomeRoute()];
        transitionDirection.value = 'home';
    }

    function openPhone() {
        if (!String(options.selectedSessionId.value || '').trim()) {return;}
        if (activeRoute.value.kind === 'app' && !getTavernPhoneApp(activeRoute.value.appId)) {
            replaceWithHome();
        }
        isOpen.value = true;
    }

    function closePhone() {
        isOpen.value = false;
    }

    function launchApp(appId = '') {
        const app = getTavernPhoneApp(appId);
        if (!app) {return;}
        routeStack.value = [
            createTavernPhoneHomeRoute(),
            createTavernPhoneAppRoute(app.id, app.rootPath),
        ];
        transitionDirection.value = 'forward';
    }

    function pushAppRoute(appId = '', path = '', params?: Record<string, string>) {
        const app = getTavernPhoneApp(appId);
        if (!app) {return;}
        const next = createTavernPhoneAppRoute(app.id, path || app.rootPath, params);
        if (appRoutesMatch(activeRoute.value, next)) {return;}
        routeStack.value = [
            ...routeStack.value,
            next,
        ];
        transitionDirection.value = 'forward';
    }

    function replaceAppRoute(appId = '', path = '', params?: Record<string, string>) {
        const app = getTavernPhoneApp(appId);
        if (!app) {return;}
        const next = createTavernPhoneAppRoute(app.id, path || app.rootPath, params);
        routeStack.value = routeStack.value.length > 1
            ? [...routeStack.value.slice(0, -1), next]
            : [createTavernPhoneHomeRoute(), next];
    }

    function back() {
        if (routeStack.value.length <= 1) {return;}
        routeStack.value = routeStack.value.slice(0, -1);
        transitionDirection.value = 'back';
    }

    function backOrClose() {
        if (routeStack.value.length > 1) {
            back();
            return;
        }
        closePhone();
    }

    function home() {
        if (isHome.value) {return;}
        replaceWithHome();
    }

    function isAppRouteVisible(sessionId = '', appId = '', pathPrefix = ''): boolean {
        const route = activeRoute.value;
        return isOpen.value
            && String(options.selectedSessionId.value || '').trim() === String(sessionId || '').trim()
            && route.kind === 'app'
            && route.appId === appId
            && (!pathPrefix || route.path.startsWith(pathPrefix));
    }

    watch(options.selectedSessionId, () => {
        isOpen.value = false;
        replaceWithHome();
    });

    return {
        activeApp,
        activeRoute,
        apps,
        back,
        backOrClose,
        closePhone,
        home,
        isAppRouteVisible,
        isHome,
        isOpen,
        launchApp,
        openPhone,
        presentationMode: viewport.presentationMode,
        pushAppRoute,
        replaceAppRoute,
        routeStack,
        transitionDirection,
        viewportHeight: viewport.viewportHeight,
        viewportOffsetLeft: viewport.viewportOffsetLeft,
        viewportOffsetTop: viewport.viewportOffsetTop,
        viewportWidth: viewport.viewportWidth,
    };
}
