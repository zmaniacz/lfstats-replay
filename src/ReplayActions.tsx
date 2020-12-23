import React, { memo } from "react";
import { FixedSizeList } from "react-window";

function ReplayActions({ data }: any) {
  const Row = ({ index, style }: { index: number; style: any }) => (
    <li key={data[index].id}>
      {data[index].player_name} {data[index].action_text}{" "}
      {data[index].target_name}
    </li>
  );

  return (
    <FixedSizeList
      height={500}
      itemCount={data.length}
      itemSize={10}
      width={500}
    >
      {Row}
    </FixedSizeList>
  );
}

export default memo(ReplayActions);
