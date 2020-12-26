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
        index
        neutral_team
        team_deltas {
          score_time
          sum
        }
      }
    }
    game_logs(where: { game_id: { _eq: $gameId } }) {
      id
      time: action_time
      type: action_type
      text: action_text
      gameId: game_id
      state
      actorId: player_id
      actorIpl: player
      actorColor: player_color
      actorColorEnum: player_color_enum
      actorName: player_name
      actorTeamIndex: player_team_index
      targetId: target_id
      targetIpl: target
      targetColor: target_color
      targetColorEnum: target_color_enum
      targetName: target_name
      targetTeamIndex: target_team_index
      genIpl: gen_id
      genName: gen_name
      genColor: gen_color
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

  return <ReplayView game={data.game} actions={data.game_logs} />;
}
