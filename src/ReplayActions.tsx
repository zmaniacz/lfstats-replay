import { EuiText } from "@elastic/eui";
import React, { memo } from "react";
import { IconType } from "react-icons";
import {
  GiHeavyBullets,
  GiMedicalPack,
  GiHumanTarget,
  GiLaserPrecision,
  GiTargetLaser,
  GiBrokenArrow,
  GiGuitar,
  GiDrum,
} from "react-icons/gi";
import { FixedSizeList } from "react-window";
import { GameAction, HashTable } from "./types";
import { colors } from "./colors";

const icons: HashTable<IconType> = {
  "0100": GiGuitar, // EventMissionStart 0100
  "0101": GiDrum, // EventMissionEnd 0101
  // EventShotEmpty 0200
  "0201": GiBrokenArrow, // EventShotMiss 0201
  // EventShotGenMiss 0202
  // EventShotGenDamage 0203
  // EventShotGenDestroy 0204
  "0205": GiTargetLaser, // EventShotOppDamage 0205
  "0206": GiLaserPrecision, // EventShotOppDown 0206
  // EventShotOwnDamage 0207
  // EventShotOwnDown 0208
  // EventMslStart 0300
  // EventMslGenMiss 0301
  // EventMslGenDamage 0302
  // EventMslGenDestroy 0303
  // EventMslMiss 0304
  // EventMslOppDamage 0305
  // EventMslOppDown 0306
  // EventMslOwnDamage 0307
  // EventMslOwnDown 0308
  // EventRapidAct 0400
  // EventRapidDeac 0401
  // EventNukeAct 0404
  // EventNukeDeton 0405
  "0500": GiHeavyBullets, // EventResupplyShots 0500
  "0502": GiMedicalPack, // EventResupplyLives 0502
  // EventResupplyTeamShots 0510
  // EventResupplyTeamLives 0512
  // EventPenalty 0600
  // EventAchieve 0900
};

function millisToMinutesAndSeconds(millis: number) {
  var minutes = Math.floor((millis / 1000 / 60) % 60);
  var seconds = Math.floor((millis / 1000) % 60);
  return seconds === 60
    ? minutes + 1 + ":00"
    : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

interface ReplayActionsProps {
  actions: Array<GameAction>;
}

function ReplayActions({ actions }: ReplayActionsProps) {
  const Row = ({ index, style }: { index: number; style: any }) => {
    const ActionIcon: IconType = icons[actions[index].type] || GiHumanTarget;
    return (
      <EuiText
        key={actions[index].id}
        style={{ color: colors[actions[index].actorColor], ...style }}
      >
        {millisToMinutesAndSeconds(actions[index].time)} <ActionIcon /> {actions[index].actorName} {actions[index].text}{" "}
        {actions[index].targetName}
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
