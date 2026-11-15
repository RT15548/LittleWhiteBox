(input, { get }) => {
  const id=input[0];
  const titles={'L-01':'舱单的骑缝处有重新装订的痕迹','L-02':'手套上的油与四号货舱泵组一致','L-03':'私账页片上的笔迹与某人相符'};
  return {...get(['docket','leads',id]),opened:true,title:titles[id]};
}
