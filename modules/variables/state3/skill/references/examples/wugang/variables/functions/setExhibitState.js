(input, { get }) => {
  const id=input[0], operation=input[1], arg=input[2];
  const exhibits=get(['docket','exhibits']), ex=exhibits[id];
  let changed;
  if (operation === 'discover') changed={...ex,custodian:'clerk'};
  else if (operation === 'transfer') {
    changed={...ex,custodian:arg};
    if (['suspect_a','suspect_b','suspect_c'].includes(arg)) changed={...changed,legalChain:false,contamination:'tainted'};
  } else if (operation === 'seal') changed={...ex,sealed:true};
  else if (operation === 'inspect') {
    const roll=arg && arg[id];
    if (typeof roll !== 'number' || !Number.isFinite(roll) || roll < 0 || roll >= 1) throw new Error('Missing or invalid prepared inspection roll: '+id);
    const rates={'EX-01':0.75,'EX-02':0.25,'EX-03':0.80,'EX-04':0.80,'EX-05':0.35};
    const match=roll < Math.min(1,rates[id]+(ex.sealed?0.12:0));
    const notes={
      'EX-01':['骑缝处的装订针脚与原始记录不连续，这一页是后来换上去的。','骑缝针脚连续，看不出换页痕迹。'],
      'EX-02':['存根联的撕口与本票对得上，取货时间被人为改过。','存根联与撕口并不匹配，这张票不是从这一本上撕下来的。'],
      'EX-03':['手套内侧的油渍与四号货舱泵组的润滑油成分一致。','油渍成分与船上任何一处泵组都不吻合。'],
      'EX-04':['刮痕的金属碎屑与驳船货舱门的漆层吻合。','碎屑与货舱门漆层不符，样本来源存疑。'],
      'EX-05':['页片上的笔迹与一名嫌疑人的书写习惯相符。','笔迹与在场任何人都对不上。']
    };
    changed={...ex,inspected:true,authenticity:match?'genuine':'forged',tested:match?'match':'mismatch',testLabel:notes[id][match?0:1]};
  } else throw new Error('Unknown exhibit operation');
  return {...exhibits,[id]:changed};
}
