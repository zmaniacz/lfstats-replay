import React, { useEffect, useState } from "react";
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui";
import { VictoryChart, VictoryGroup, VictoryLine } from "victory";
import ReplayActions from "./ReplayActions";
import ReplayTable from "./ReplayTable";
import { GameAction } from "./types";

function millisToMinutesAndSeconds(millis: number) {
  var minutes = Math.floor((millis / 1000 / 60) % 60);
  var seconds = Math.floor((millis / 1000) % 60);
  return seconds === 60
    ? minutes + 1 + ":00"
    : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

interface ReplayViewProps {
  game: any;
  actions: Array<GameAction>;
}

export default function ReplayView({ game, actions }: ReplayViewProps) {
  const [milliseconds, setMilliseconds] = useState(0);
  const [visibleActions, setVisibleActions] = useState<Array<GameAction>>([]);
  const [deltas, setDeltas] = useState<Array<any>>([]);
  const [isActive, setIsActive] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const gameLength = game.game_length * 1000;

  function toggle() {
    setIsActive(!isActive);
  }

  useEffect(() => {
    let interval: any = null;
    if (isActive && milliseconds <= gameLength + 1000) {
      setVisibleActions(
        actions.filter((action) => action.time <= milliseconds).reverse()
      );
      setDeltas(
        game.game_teams.map((team: any) => {
          return {
            colorDesc: team.color_desc,
            colorEnum: team.color_enum,
            colorNormal: team.color_normal,
            index: team.index,
            teamDeltas: team.team_deltas.filter(
              (delta: any) => delta.score_time <= milliseconds
            ),
          };
        })
      );
      interval = setTimeout(() => {
        setMilliseconds((milliseconds) => milliseconds + 150 * playbackSpeed);
      }, 100);
    } else if (!isActive && milliseconds !== 0) {
      clearTimeout(interval);
    }
    return () => clearTimeout(interval);
  }, [isActive, milliseconds, game, actions, gameLength, playbackSpeed]);

  function reset() {
    setMilliseconds(0);
    setIsActive(false);
    setVisibleActions([]);
    setDeltas([]);
  }

  return (
    <>
      <EuiText color="danger">{game.game_datetime}</EuiText>
      <EuiText>
        {millisToMinutesAndSeconds(milliseconds)} /{" "}
        {millisToMinutesAndSeconds(gameLength)}
      </EuiText>
      <EuiButton onClick={toggle}>{isActive ? "Pause" : "Start"}</EuiButton>
      <EuiButton onClick={reset}>Reset</EuiButton>
      <EuiButton onClick={() => setPlaybackSpeed(1)}>1x</EuiButton>
      <EuiButton onClick={() => setPlaybackSpeed(5)}>5x</EuiButton>
      <EuiButton onClick={() => setPlaybackSpeed(10)}>10x</EuiButton>
      <EuiFlexGroup alignItems="flexStart">
        <EuiFlexItem>
          {
            <VictoryChart animate={{ duration: 500, easing: "linear" }}>
              {deltas?.map((team: any) => (
                <VictoryGroup key={team.colorNormal}>
                  <VictoryLine
                    data={team.teamDeltas}
                    x="score_time"
                    y="sum"
                    style={{ data: { stroke: team.colorNormal } }}
                    interpolation="basis"
                  />
                </VictoryGroup>
              ))}
            </VictoryChart>
          }
        </EuiFlexItem>
        <EuiFlexItem>
          {visibleActions[0] && (
            <ReplayTable state={visibleActions[0]?.state} deltas={deltas} time={milliseconds} />
          )}
        </EuiFlexItem>
        <EuiFlexItem>
          {visibleActions.length > 0 && (
            <ReplayActions actions={visibleActions} />
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
