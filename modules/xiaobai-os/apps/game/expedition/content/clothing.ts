import type { Participant } from './participants.js';

export const CLOTHING_SLOTS = {
    outer: '外衣', lower: '下装', inner: '内衣', underpants: '内裤', shoes: '鞋', socks: '袜',
} as const;
export type ClothingSlot = keyof typeof CLOTHING_SLOTS;
export type Clothing = Record<ClothingSlot, string | null>;
export type ClothingChange = Partial<Clothing>;

/** First-meeting clothing, not a catalogue of permitted outfits. */
export const INITIAL_CLOTHING: Record<Participant, Clothing> = {
    sanniang: {
        outer: '深靛蓝短外搭，米白滚边；内搭米白高领盘扣长衫，束褐红布带',
        lower: '深蓝长裙，腰间收褶，裙摆细密包边',
        inner: '米白软绸软杯小围，细棉衬里，侧边小揿扣',
        underpants: '米白细棉短平角内裤，细绸滚边，侧腰布带系结',
        shoes: '深靛蓝圆口布鞋，千层布底，鞋口镶窄细边',
        socks: '素白细棉中筒袜，袜口双层收边',
    },
    laobai: {
        outer: '宽松灰蓝长外套，内搭本白布衫，围旧灰褐围巾',
        lower: '深灰直筒厚布长裤，腰系磨旧的棕皮带',
        inner: '本白软棉无袖汗衫，领口包边，布色略旧',
        underpants: '灰白棉布宽松平角内裤，短裤腿，布带腰头',
        shoes: '旧褐皮短靴，宽鞋楦，靴头磨浅',
        socks: '灰色厚棉中筒袜，袜底有补片',
    },
    kouzi: {
        outer: '灰蓝翻领短工装，肘部补强；内搭本白布衫，系赭黄围巾',
        lower: '深灰厚布工裤，膝部双层补片，腰系皮质工具带',
        inner: '灰白棉布宽肩带短背心，领口与下缘包边',
        underpants: '深灰软棉短平角内裤，裆部双层，腰头穿扁布带',
        shoes: '旧褐色系带工作靴，厚底，靴头加皮补强',
        socks: '深灰厚棉短袜，袜筒过踝，后跟有同色补线',
    },
    anian: {
        outer: '浅紫交领长袖衫，外罩灰紫无袖衣，束深紫布带',
        lower: '灰紫长裙，裙摆镶浅紫细边',
        inner: '浅杏细棉背心式小围，淡紫滚边，前襟贝壳小扣',
        underpants: '浅杏细棉短平角内裤，裤口窄包边，腰头穿松紧带',
        shoes: '灰紫一字带布鞋，脚背小搭扣，平底',
        socks: '浅灰棉线及膝袜，罗纹袜口',
    },
    bajin: {
        outer: '深蓝立领绗缝棉号衣，外覆铆钉胸甲，以皮肩带固定',
        lower: '深色厚布军裤，直筒裤腿，束皮腰带',
        inner: '本白棉布圆领汗衫，短袖，肩缝加固',
        underpants: '灰色棉布短平角内裤，宽裤口，抽带腰头',
        shoes: '黑褐皮军靴，靴面上油，厚底',
        socks: '深灰厚棉长袜，罗纹袜口',
    },
    changyounian: {
        outer: '深蓝呢制服外套，米白翻领、铜色扣饰；内搭深色立领衫，束暗红腰带',
        lower: '深蓝厚呢制服长裤，里面加穿灰白棉毛裤',
        inner: '本白细棉圆领长袖汗衫，袖口窄收',
        underpants: '本白细棉短平角内裤，腰侧小扣，裤口细密包边',
        shoes: '黑色皮短靴，低跟，靴面擦得匀亮',
        socks: '深灰羊毛混棉中筒袜，加厚袜底',
    },
};

export const CLOTHING_COPY = {
    title: '服饰', absent: '未穿', changed: '服饰变化', rejected: '服饰未完整更新。',
};
