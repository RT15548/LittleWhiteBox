export const REVIEW_COPY = {
    title: '荒岛 · 人物样模', status: '美术检视，未接入游戏', loading: '正在载入模型…',
    full: '全身', portrait: '面部', game: '俯视', idle: '站立', walk: '行走',
    shirt: '上衣', trousers: '长裤', reload: '重新载入', error: '模型载入失败',
    'inner-top': '内搭', 'inner-shorts': '内裤', noGarments: '模型缺少独立衣物信息',
    viewport: '可旋转的人物模型', appearance: '衣物显示', framing: '镜头', motion: '动作',
    assetRequired: 'Pass --asset with the path to the exported GLB.',
    missingAnimation: name => `模型缺少动作：${name}`,
    missingClothing: name => `模型缺少独立衣物：${name}`,
};
