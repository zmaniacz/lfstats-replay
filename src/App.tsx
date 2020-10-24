import React from "react";
import { LoadError } from "./LFLoad";
import ReplayContainer from "./ReplayContainer";

import "@elastic/eui/dist/eui_theme_amsterdam_light.css";

function App() {
  const gameId = Number(
    new URLSearchParams(window.location.search).get("gameId")
  );

  if (typeof gameId === "number") return <ReplayContainer gameId={gameId} />;
  else return <LoadError />;
}

export default App;
