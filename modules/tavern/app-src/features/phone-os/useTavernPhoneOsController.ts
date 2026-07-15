import { computed, onUnmounted, ref, unref, watch, type Ref } from 'vue';
import {
    createTavernPhoneAppRoute,
    createTavernPhoneHomeRoute,
    type TavernPhoneAppDefinition,
    type TavernPhoneOsRoute,
} from './phone-os-types';
import { useTavernPhoneViewport } from './useTavernPhoneViewport';

export interface TavernPhoneOsControllerOptions {
    apps: readonly TavernPhoneAppDefinition[];
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
    const registeredApps = [...options.apps];
    const apps = computed(() => registeredApps.filter((app) => (
        app.isAvailable === undefined || !!unref(app.isAvailable)
    )));
    let lifecycleAppId = '';

    function findRegisteredApp(appId = '') {
        const id = String(appId || '').trim();
        return registeredApps.find((app) => app.id === id) || null;
    }

    function findApp(appId = '') {
        const id = String(appId || '').trim();
        return apps.value.find((app) => app.id === id) || null;
    }

    function runAppLifecycle(
        app: TavernPhoneAppDefinition | null,
        hook: 'onActivate' | 'onDeactivate',
    ) {
        const callback = app?.[hook];
        if (!callback) {return;}
        void Promise.resolve().then(() => callback()).catch((error) => {
            console.warn(`[LittleWhiteBox/tavern] Phone app ${hook} failed`, app.id, error);
        });
    }

    function activateApp(app: TavernPhoneAppDefinition | null) {
        if (!app || lifecycleAppId === app.id) {return;}
        deactivateApp();
        lifecycleAppId = app.id;
        runAppLifecycle(app, 'onActivate');
    }

    function deactivateApp() {
        if (!lifecycleAppId) {return;}
        const app = findRegisteredApp(lifecycleAppId);
        lifecycleAppId = '';
        runAppLifecycle(app, 'onDeactivate');
    }

    const activeRoute = computed<TavernPhoneOsRoute>(() => (
        routeStack.value.at(-1) || createTavernPhoneHomeRoute()
    ));
    const activeApp = computed(() => (
        activeRoute.value.kind === 'app'
            ? findApp(activeRoute.value.appId)
            : null
    ));
    const isHome = computed(() => activeRoute.value.kind === 'home');

    function replaceWithHome() {
        routeStack.value = [createTavernPhoneHomeRoute()];
        transitionDirection.value = 'home';
    }

    function openPhone() {
        if (!String(options.selectedSessionId.value || '').trim()) {return;}
        if (activeRoute.value.kind === 'app' && !findApp(activeRoute.value.appId)) {
            replaceWithHome();
        }
        isOpen.value = true;
        activateApp(activeApp.value);
    }

    function closePhone() {
        deactivateApp();
        isOpen.value = false;
    }

    function launchApp(appId = '') {
        const app = findApp(appId);
        if (!app) {return;}
        routeStack.value = [
            createTavernPhoneHomeRoute(),
            createTavernPhoneAppRoute(app.id, app.rootPath),
        ];
        transitionDirection.value = 'forward';
        if (isOpen.value) {activateApp(app);}
    }

    function pushAppRoute(appId = '', path = '', params?: Record<string, string>) {
        const app = findApp(appId);
        if (!app) {return;}
        const next = createTavernPhoneAppRoute(app.id, path || app.rootPath, params);
        if (appRoutesMatch(activeRoute.value, next)) {return;}
        routeStack.value = [
            ...routeStack.value,
            next,
        ];
        transitionDirection.value = 'forward';
        if (isOpen.value) {activateApp(app);}
    }

    function replaceAppRoute(appId = '', path = '', params?: Record<string, string>) {
        const app = findApp(appId);
        if (!app) {return;}
        const next = createTavernPhoneAppRoute(app.id, path || app.rootPath, params);
        routeStack.value = routeStack.value.length > 1
            ? [...routeStack.value.slice(0, -1), next]
            : [createTavernPhoneHomeRoute(), next];
        if (isOpen.value) {activateApp(app);}
    }

    function back() {
        if (routeStack.value.length <= 1) {return;}
        const currentAppId = activeRoute.value.kind === 'app' ? activeRoute.value.appId : '';
        routeStack.value = routeStack.value.slice(0, -1);
        transitionDirection.value = 'back';
        const nextAppId = activeRoute.value.kind === 'app' ? activeRoute.value.appId : '';
        if (currentAppId && currentAppId !== nextAppId) {deactivateApp();}
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
        deactivateApp();
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
        deactivateApp();
        isOpen.value = false;
        replaceWithHome();
    });

    watch(() => apps.value.map((app) => app.id).join('|'), () => {
        if (activeRoute.value.kind !== 'app' || findApp(activeRoute.value.appId)) {return;}
        deactivateApp();
        replaceWithHome();
    });

    onUnmounted(deactivateApp);

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
