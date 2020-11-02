import { NowRequest, NowResponse } from "@vercel/node";
import { createPool, sql } from "slonik";
import { isNull, cloneDeep } from "lodash";
import { Map } from "immutable";

const pool = createPool(process.env.DATABASE_URL);

interface Game {
  id: number;
  name: string;
  length: number;
  duration: number;
}

interface GameActor {
  id: number;
  iplId: string;
  name: string;
  position: string;
  teamIndex: number;
  score?: number;
}

interface GameObject {
  id: number;
  iplId: string;
  name: string;
  teamIndex: number;
  type: string;
}

interface GameAction {
  id: number;
  time: number;
  type: string;
  text: string;
  actorId?: number;
  actorIpl?: string;
  actorColor?: string;
  actorName?: string;
  targetId?: string;
  targetIpl?: string;
  targetColor?: string;
  targetName?: string;
  teamIndex?: number;
  targetTeamIndex?: number;
  genIpl?: string;
  genName?: string;
  genColor?: string;
}

type GameState = Map<string, GameActor>;

module.exports = (req: NowRequest, res: NowResponse) => {
  const { gameId }: { gameId?: number } = req.query;
  console.log("new run");
  if (gameId) {
    pool.connect(async (connection) => {
      const game: Game = await connection.maybeOne<Game>(
        sql`
        SELECT
          id          "id", 
          game_name   "name",
          game_length "length",
          duration    "duration"
        FROM games
        WHERE games.id=${gameId}
      `
      );
      if (game) {
        const gameObjects: readonly GameObject[] = await connection.many<
          GameObject
        >(
          sql`
          SELECT 
            id      "id",
            ipl_id  "iplId",
            name    "name",
            team    "teamIndex",
            type    "type"
          FROM game_objects
          WHERE game_id=${gameId}
        `
        );
        const gameActions: readonly GameAction[] = await connection.many<
          GameAction
        >(
          sql`
          SELECT
            id            "id", 
            action_time   "time",
            action_type   "type",
            action_text   "text",
            player_id     "actorId",
            player        "actorIpl",
            player_color  "actorColor",
            player_name   "actorName",
            target_id     "targetId",
            target        "targetIpl",
            target_color  "targetColor",
            target_name   "targetName",
            team_index    "teamIndex",
            target_team_index "targetTeamIndex",
            gen_id        "genIpl",
            gen_name      "genName",
            gen_color     "genColor"
          FROM game_logs
          WHERE game_id=${gameId}
          ORDER BY action_time ASC
        `
        );
        const gameActors: readonly GameActor[] = await connection.many<
          GameActor
        >(
          sql`
          SELECT 
            scorecards.player_id    "id",
            scorecards.player_name  "name",
            scorecards.position     "position",
            game_teams.index        "teamIndex",
            players.ipl_id          "iplId"
          FROM scorecards
          LEFT JOIN game_teams on scorecards.team_id = game_teams.id
          LEFT JOIN players on scorecards.player_id = players.id
          WHERE scorecards.game_id=${gameId}
        `
        );

        //Build initial player states
        //TODO: add defaults per position and flesh out full set of state vars
        let currentState: GameState = Map<string, GameActor>(
          gameActors.map((actor) => {
            return [actor.iplId, { score: 0, ...actor }];
          })
        );

        let states = Map<number, GameState>();

        //start the collector loop - grab all actions from 0 to frameLength (apply counter to 0 for subsequent loops)
        let nextState: GameState;
        gameActions.forEach((action) => {
          nextState = applyAction(currentState, action);
          states = states.set(action.id, nextState);
          currentState = nextState;
        });

        //save generated state and actions
        console.log("start isnert");
        let statesArray = states.entrySeq().toArray();
        for (let i = 0; i < statesArray.length; i += 100) {
          let chunk = statesArray.slice(i, i + 100);
          console.log(`key: ${i}`);
          await connection.query(
            sql`
              INSERT INTO game_states
                (action_id, state)
              VALUES
                (
                  ${sql.join(
                    chunk.map((action) =>
                      sql.join([action[0], JSON.stringify(action[1])], sql`, `)
                    ),
                    sql`), (`
                  )}
                )
              ON CONFLICT (action_id)
              DO UPDATE SET state = excluded.state
            `
          );
        }

        res.send("success");
      } else res.status(404).send("Game not found");
    });
  } else res.send("No game provided");
};

function applyAction(state: GameState, action: GameAction) {
  let nextState = cloneDeep(state);
  let actor: GameActor;
  let target: GameActor;
  if (!isNull(action.actorIpl)) actor = nextState.get(action.actorIpl);
  if (!isNull(action.targetIpl)) target = nextState.get(action.targetIpl);

  if (action.type === "0205" || action.type === "0206") {
    actor.score += 100;
    target.score -= 20;
  }

  return nextState;
}
