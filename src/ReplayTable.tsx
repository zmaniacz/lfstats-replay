import React from "react";
import { EuiPanel, EuiBasicTable } from "@elastic/eui";

export default function ReplayTable({ state, deltas }: any) {
  deltas = deltas.map((team: any) => ({
    totals: Object.values(state)
      .filter((element: any) => element.teamIndex === team.index)
      .reduce(
        (acc: any, cur: any) => {
          return {
            score: (acc.score += cur.score),
            shotsLeft: (acc.shotsLeft += cur.shotsLeft),
            livesLeft: (acc.livesLeft += cur.livesLeft),
          };
        },
        { score: 0, shotsLeft: 0, livesLeft: 0 }
      ),
    ...team,
  }));

  return deltas
    .sort((a: any, b: any) => b.totals.score - a.totals.score)
    .map((team: any) => {
      let items = Object.values(state)
        .filter((element: any) => element.teamIndex === team.index)
        .sort((a: any, b: any) => b.score - a.score);
      let columns = [
        {
          field: "name",
          name: "Player",
          footer: <em>Total:</em>,
        },
        {
          field: "score",
          name: "Score",
          footer: ({ items }: any) => (
            <span>
              {items.reduce((acc: number, cur: any) => (acc += cur.score), 0)}
            </span>
          ),
        },
        {
          field: "livesLeft",
          name: "Lives Left",
          footer: ({ items }: any) => (
            <span>
              {items.reduce(
                (acc: number, cur: any) => (acc += cur.livesLeft),
                0
              )}
            </span>
          ),
        },
        {
          field: "shotsLeft",
          name: "Shots Left",
          footer: ({ items }: any) => (
            <span>
              {items.reduce(
                (acc: number, cur: any) => (acc += cur.shotsLeft),
                0
              )}
            </span>
          ),
        },
      ];
      return (
        <EuiPanel key={team.index}>
          <EuiBasicTable
            items={items}
            columns={columns}
            compressed={true}
            tableCaption={team.color_desc}
          />
        </EuiPanel>
      );
    });
}
