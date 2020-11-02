import React from "react";

export default function ReplayTable({ state }: any) {
  return (
    <ul>
      <li>player score shots</li>
      {Object.values(state).map((element: any) => (
        <li key={element.iplId}>
          {element.name} {element.score} {element.shotsLeft}/{element.shotsMax}
        </li>
      ))}
    </ul>
  );
}
