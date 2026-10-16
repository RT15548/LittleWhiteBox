export const FIRST_CHAPTER = Object.freeze({ id: 'outpost', number: '第一章', numeral: 'I', title: '哨站救援' } as const);
export const RESCUE_COMPLETE = ['captives_arrived', 'supplies_secured', 'warden_defeated'] as const;
export const SECOND_CHAPTER = Object.freeze({ id: 'inner_city', number: '第二章', numeral: 'II', title: '墙里灯火' } as const);
export const FINAL_CHAPTER = Object.freeze({ id: 'furnace', number: '终章', numeral: 'III', title: '长夜重燃' } as const);
export const CHAPTER_IDS = [FIRST_CHAPTER.id, SECOND_CHAPTER.id, FINAL_CHAPTER.id] as const;
export type ChapterId = typeof CHAPTER_IDS[number];
