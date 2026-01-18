// widgets/message-toolbar.js
/**
 * 消息工具栏管理器
 * 统一管理消息级别的功能按钮（TTS、画图等）
 */

let toolbarMap = new WeakMap();
const registeredComponents = new Map(); // messageId -> Map<componentId, element>

let stylesInjected = false;

function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    
    const style = document.createElement('style');
    style.id = 'xb-msg-toolbar-styles';
    style.textContent = `
.xb-msg-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 0;
    min-height: 34px;
    flex-wrap: wrap;
}

.xb-msg-toolbar:empty {
    display: none;
}

.xb-msg-toolbar-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.xb-msg-toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
}

.xb-msg-toolbar-left:empty {
    display: none;
}

.xb-msg-toolbar-right:empty {
    display: none;
}
`;
    document.head.appendChild(style);
}

function getMessageElement(messageId) {
    return document.querySelector(`.mes[mesid="${messageId}"]`);
}

/**
 * 获取或创建消息的工具栏
 */
export function getOrCreateToolbar(messageEl) {
    if (!messageEl) return null;
    
    // 已有工具栏且有效
    if (toolbarMap.has(messageEl)) {
        const existing = toolbarMap.get(messageEl);
        if (existing.isConnected) return existing;
        toolbarMap.delete(messageEl);
    }
    
    injectStyles();
    
    // 找锚点
    const nameBlock = messageEl.querySelector('.mes_block > .ch_name') || 
                      messageEl.querySelector('.name_text')?.parentElement;
    if (!nameBlock) return null;
    
    // 检查是否已有工具栏
    let toolbar = nameBlock.parentNode.querySelector(':scope > .xb-msg-toolbar');
    if (toolbar) {
        toolbarMap.set(messageEl, toolbar);
        ensureSections(toolbar);
        return toolbar;
    }
    
    // 创建工具栏
    toolbar = document.createElement('div');
    toolbar.className = 'xb-msg-toolbar';
    
    const leftSection = document.createElement('div');
    leftSection.className = 'xb-msg-toolbar-left';
    
    const rightSection = document.createElement('div');
    rightSection.className = 'xb-msg-toolbar-right';
    
    toolbar.appendChild(leftSection);
    toolbar.appendChild(rightSection);
    
    nameBlock.parentNode.insertBefore(toolbar, nameBlock.nextSibling);
    toolbarMap.set(messageEl, toolbar);
    
    return toolbar;
}

function ensureSections(toolbar) {
    if (!toolbar.querySelector('.xb-msg-toolbar-left')) {
        const left = document.createElement('div');
        left.className = 'xb-msg-toolbar-left';
        toolbar.insertBefore(left, toolbar.firstChild);
    }
    if (!toolbar.querySelector('.xb-msg-toolbar-right')) {
        const right = document.createElement('div');
        right.className = 'xb-msg-toolbar-right';
        toolbar.appendChild(right);
    }
}

/**
 * 注册组件到工具栏
 */
export function registerToToolbar(messageId, element, options = {}) {
    const { position = 'left', id } = options;
    
    const messageEl = getMessageElement(messageId);
    if (!messageEl) return false;
    
    const toolbar = getOrCreateToolbar(messageEl);
    if (!toolbar) return false;
    
    // 设置组件 ID
    if (id) {
        element.dataset.toolbarId = id;
        
        // 去重：移除已存在的同 ID 组件
        const existing = toolbar.querySelector(`[data-toolbar-id="${id}"]`);
        if (existing && existing !== element) {
            existing.remove();
        }
    }
    
    // 插入到对应区域
    const section = position === 'right' 
        ? toolbar.querySelector('.xb-msg-toolbar-right')
        : toolbar.querySelector('.xb-msg-toolbar-left');
    
    if (section && !section.contains(element)) {
        section.appendChild(element);
    }
    
    // 记录
    if (!registeredComponents.has(messageId)) {
        registeredComponents.set(messageId, new Map());
    }
    if (id) {
        registeredComponents.get(messageId).set(id, element);
    }
    
    return true;
}

/**
 * 从工具栏移除组件
 */
export function removeFromToolbar(messageId, element) {
    if (!element) return;
    
    const componentId = element.dataset?.toolbarId;
    element.remove();
    
    // 清理记录
    const components = registeredComponents.get(messageId);
    if (components && componentId) {
        components.delete(componentId);
        if (components.size === 0) {
            registeredComponents.delete(messageId);
        }
    }
    
    cleanupEmptyToolbar(messageId);
}

/**
 * 根据 ID 移除组件
 */
export function removeFromToolbarById(messageId, componentId) {
    const messageEl = getMessageElement(messageId);
    if (!messageEl) return;
    
    const toolbar = toolbarMap.get(messageEl);
    if (!toolbar) return;
    
    const element = toolbar.querySelector(`[data-toolbar-id="${componentId}"]`);
    if (element) {
        removeFromToolbar(messageId, element);
    }
}

/**
 * 检查组件是否已注册
 */
export function hasComponent(messageId, componentId) {
    const messageEl = getMessageElement(messageId);
    if (!messageEl) return false;
    
    const toolbar = toolbarMap.get(messageEl);
    if (!toolbar) return false;
    
    return !!toolbar.querySelector(`[data-toolbar-id="${componentId}"]`);
}

/**
 * 清理空工具栏
 */
function cleanupEmptyToolbar(messageId) {
    const messageEl = getMessageElement(messageId);
    if (!messageEl) return;
    
    const toolbar = toolbarMap.get(messageEl);
    if (!toolbar) return;
    
    const leftSection = toolbar.querySelector('.xb-msg-toolbar-left');
    const rightSection = toolbar.querySelector('.xb-msg-toolbar-right');
    
    const isEmpty = (!leftSection || leftSection.children.length === 0) &&
                    (!rightSection || rightSection.children.length === 0);
    
    if (isEmpty) {
        toolbar.remove();
        toolbarMap.delete(messageEl);
    }
}

/**
 * 移除消息的整个工具栏
 */
export function removeToolbar(messageId) {
    const messageEl = getMessageElement(messageId);
    if (!messageEl) return;
    
    const toolbar = toolbarMap.get(messageEl);
    if (toolbar) {
        toolbar.remove();
        toolbarMap.delete(messageEl);
    }
    registeredComponents.delete(messageId);
}

/**
 * 清理所有工具栏
 */
export function removeAllToolbars() {
    document.querySelectorAll('.xb-msg-toolbar').forEach(t => t.remove());
    toolbarMap = new WeakMap();
    registeredComponents.clear();
}

/**
 * 获取工具栏（如果存在）
 */
export function getToolbar(messageId) {
    const messageEl = getMessageElement(messageId);
    return messageEl ? toolbarMap.get(messageEl) : null;
}
