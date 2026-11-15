(input, { get }) => {
  const code=input[0], speaker=get(['docket','people',code,'name']);
  const testimonies={
    suspect_a:{topic:'当夜的舱单签字',stance:'suspect_b',text:'我把班排完就回办公室核舱单，签完的那一版是好的。押运来换过页。'},
    suspect_b:{topic:'当夜的行程',stance:'suspect_a',text:'我在船上睡觉，什么都没碰。舱单是调度长让我补的，我只是跑腿。'},
    suspect_c:{topic:'货代牵线',stance:'',text:'我只是牵个线。谁动的手我不知道，行业里这种事不好深究。'},
    witness:{topic:'甲板上看到的人',stance:'',text:'半夜有个人在甲板上蹲着擦手，个子不高，走路外八。我眼睛不行，看不太准。'}
  };
  const testimony=testimonies[code];
  if (!testimony) throw new Error('No testimony for '+code);
  const id='C-'+code;
  return {...get(['docket','claims']),[id]:{id,speaker,...testimony}};
}
