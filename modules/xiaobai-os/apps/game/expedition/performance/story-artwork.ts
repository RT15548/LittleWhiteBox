import wenshoutong from '../assets/portrait-wenshoutong.webp?url&no-inline';
import chenhe from '../assets/portrait-chenhe.webp?url&no-inline';
import qinzhi from '../assets/portrait-qinzhi.webp?url&no-inline';
import liangyoufang from '../assets/portrait-liangyoufang.webp?url&no-inline';
import chengtiesheng from '../assets/portrait-chengtiesheng.webp?url&no-inline';
import type { StoryPerson } from '../content/inner-city/people.js';

export const STORY_PORTRAITS = { wenshoutong, chenhe, qinzhi, liangyoufang, chengtiesheng } satisfies Record<StoryPerson, string>;
