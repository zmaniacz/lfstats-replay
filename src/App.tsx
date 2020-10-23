import React from "react";
import ReplayContainer from "./ReplayContainer";
import { LoadError } from "./LFLoad";

function App() {
  const gameId = Number(
    new URLSearchParams(window.location.search).get("gameId")
  );

  if (typeof gameId === "number") return <ReplayContainer gameId={gameId} />;
  else return <LoadError />;
}

export default App;
