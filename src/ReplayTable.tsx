import React from "react";

export default function ReplayTable({ state }: any) {
  return (
    <table>
      <tr>
        <th>player</th>
        <th>score</th>
        <th>shots</th>
        <th>lives</th>
      </tr>
      {Object.values(state).map((element: any) => (
        <tr key={element.iplId}>
          <td>
            {element.name} ({element.position})
          </td>
          <td>{element.score}</td>
          <td>{element.shotsLeft}</td>
          <td>{element.livesLeft}</td>
        </tr>
      ))}
    </table>
  );
}
