export const FIRST_CHAPTER = Object.freeze({ id: 'outpost', number: '第一章', numeral: 'I', title: '哨站救援' } as const);
export type ChapterId = typeof FIRST_CHAPTER.id;
export const chapterTitle = `${FIRST_CHAPTER.number} · ${FIRST_CHAPTER.title}`;
