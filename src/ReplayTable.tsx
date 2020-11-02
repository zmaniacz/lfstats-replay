import React from "react";

export default function ReplayTable({ state }: any) {
  return (
    <ul>
      {Object.values(state).map((element: any) => (
        <li key={element.iplId}>
          {element.name} {element.score}
        </li>
      ))}
    </ul>
  );
}
