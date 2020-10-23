import React, { useEffect, useState } from "react";

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

  function toggle() {
    setIsActive(!isActive);
  }

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setMilliseconds((milliseconds) => milliseconds + 5);
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
  }, [isActive, milliseconds, gameData.game_logs]);

  function reset() {
    setMilliseconds(0);
    setIsActive(false);
    setActions(null);
  }

  return (
    <>
      <div>{gameData.game.game_datetime}</div>
      <div className="time">{millisToMinutesAndSeconds(milliseconds)}</div>
      <div className="row">
        <button
          className={`button button-primary button-primary-${
            isActive ? "active" : "inactive"
          }`}
          onClick={toggle}
        >
          {isActive ? "Pause" : "Start"}
        </button>
        <button className="button" onClick={reset}>
          Reset
        </button>
      </div>
      <div>
        {actions?.map((action) => {
          return (
            <li>
              {action.player_name} {action.action_text} {action.target_name}
            </li>
          );
        })}
      </div>
    </>
  );
}
