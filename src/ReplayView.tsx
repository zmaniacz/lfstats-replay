import React, { useEffect, useState } from "react";
import { EuiButton, EuiText } from "@elastic/eui";

function millisToMinutesAndSeconds(millis: number) {
  var minutes = Math.floor((millis / 1000 / 60) % 60);
  var seconds = Math.floor((millis / 1000) % 60);
  return seconds === 60
    ? minutes + 1 + ":00"
    : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

interface ReplayViewProps {
  gameData: {
    game: any;
    game_logs: Array<any>;
  };
}

export default function ReplayView({ gameData }: ReplayViewProps) {
  const [milliseconds, setMilliseconds] = useState(0);
  const [actions, setActions] = useState<Array<any> | null>(null);
  const [isActive, setIsActive] = useState(false);

  const gameLength = gameData.game.game_length * 1000;

  function toggle() {
    setIsActive(!isActive);
  }

  useEffect(() => {
    let interval: any = null;
    if (isActive && milliseconds <= gameLength + 1000) {
      interval = setInterval(() => {
        setMilliseconds((milliseconds) => milliseconds + 1000);
      }, 1);
      setActions(
        gameData.game_logs.filter(
          (action) => action.action_time <= milliseconds
        )
      );
    } else if (!isActive && milliseconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, milliseconds, gameData, gameLength]);

  function reset() {
    setMilliseconds(0);
    setIsActive(false);
    setActions(null);
  }

  return (
    <>
      <EuiText color="danger">{gameData.game.game_datetime}</EuiText>
      <div className="time">
        {millisToMinutesAndSeconds(milliseconds)} /{" "}
        {millisToMinutesAndSeconds(gameLength)}
      </div>
      <div className="row">
        <EuiButton onClick={toggle}>{isActive ? "Pause" : "Start"}</EuiButton>
        <EuiButton onClick={reset}>Reset</EuiButton>
      </div>
      <div>
        {actions
          ?.map((action) => {
            return (
              <li key={action.action_time}>
                {action.player_name} {action.action_text} {action.target_name}
              </li>
            );
          })
          .reverse()}
      </div>
    </>
  );
}
