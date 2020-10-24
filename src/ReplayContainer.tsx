import React from "react";
import { useQuery, gql } from "@apollo/client";
import { LoadError, LoadSpinner } from "./LFLoad";
import ReplayView from "./ReplayView";

const GET_ACTIONS = gql`
  query GetGameLog($gameId: bigint!) {
    game: games_by_pk(id: $gameId) {
      id
      game_datetime
      duration
      game_length
      game_teams(where: { color_enum: { _neq: 0 } }) {
        color_desc
        color_enum
        color_normal
        id
        neutral_team
        team_deltas {
          score_time
          sum
        }
      }
    }
    game_logs(where: { game_id: { _eq: $gameId } }) {
      player_id
      player_name
      target_id
      target_name
      player_color
      target_color
      action_text
      action_time
      action_type
      game_id
    }
  }
`;

interface ReplayContainerProps {
  gameId: number;
}

export default function ReplayContainer({ gameId }: ReplayContainerProps) {
  const { data, loading, error } = useQuery(GET_ACTIONS, {
    variables: { gameId },
  });

  if (loading) return <LoadSpinner />;
  if (error) return <LoadError />;

  return <ReplayView gameData={data} />;
}
