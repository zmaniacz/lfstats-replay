import { EuiText } from "@elastic/eui";
import React, { memo } from "react";
import { IconType } from "react-icons";
import {
  GiAmmoBox,
  GiMedicalPack,
  GiHumanTarget,
  GiLaserPrecision,
  GiTargetLaser,
} from "react-icons/gi";
import { FixedSizeList } from "react-window";
import { GameAction } from "./types";

interface HashTable<T> {
  [index: string]: T;
}

const icons: HashTable<IconType> = {
  "0205": GiTargetLaser, //tag no deac
  "0206": GiLaserPrecision, //tag deac
  "0500": GiAmmoBox, //ammo resupply
  "0502": GiMedicalPack, //lives resupply
};

interface ReplayActionsProps {
  actions: Array<GameAction>;
}

function ReplayActions({ actions }: ReplayActionsProps) {
  const Row = ({ index, style }: { index: number; style: any }) => {
    const ActionIcon: IconType =
      icons[actions[index].action_type] || GiHumanTarget;
    return (
      <EuiText key={actions[index].id} style={style}>
        <ActionIcon /> {actions[index].player_name} {actions[index].action_text}{" "}
        {actions[index].target_name}
      </EuiText>
    );
  };

  return (
    <FixedSizeList
      height={500}
      itemCount={actions.length}
      itemSize={24}
      width={500}
      itemKey={(index) => actions[index].id}
    >
      {Row}
    </FixedSizeList>
  );
}

export default memo(ReplayActions);
