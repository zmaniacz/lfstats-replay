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
  id: number; //internal LFstats ID
  iplId: string; //IPL id - internal laserforce identifier
  name: string; //actor name
  position: string; //actor position
  teamIndex: number; //actor team
  score: number; //actor current score
  shotsLeft: number; //actor shots left
  shotsMax: number; //max number of shots
  livesLeft: number; //actor lives left
  livesMax: number; //max lives
  missilesLeft: number; //missiles left
  missileOpponent: number; //number of missiles that hit something
  missileTeam: number; //missiles that hit own team
  missileBase: number; //missiles on a base
  shotsHit: number; //how many shots hit something
  shotsFired: number; //how many shots fired total
  shotOpponent: number; //shot other team
  shotTeam: number; //shot own team
  shot3hit: number; //times shot a opposing 3 hit
  timesHit: number; //how many times been hit
  timesMissiled: number; //how many missiles eaten
  nukesActivated: number; //nukes activated
  nukesDetonated: number; //nukes detonated
  nukeActive: boolean; //actively nuking
  oppNukeCancel: number; //opponent nukes canceled
  ownNukeCancel: number; //own team nukes canceled
  medicHits: number; // opponent medic hits
  nukeMedicHits: number; //medic lives taken on nukes
  ownMedicHits: number; //own team medic hits
  rapidFireActive: boolean; // is rapid fire active
  rapidFires: number; //number of rapid fires activated
  ammoBoosts: number; //number of ammo boosts activated
  lifeBoosts: number; //number of life boosts activated
  penalties: number; //number of penalties earned
  resupplyTeam: number; //number of times an ammo or medic resupplies a team mate
  ammoResupplies: number; //number of times player received ammo
  lifeResupplies: number; //number fo times player recieved lives
  doubleResupplies: number; //number of times player received both ammo and lives within 1 second
  spEarned: number; //special points earned
  spSpent: number; //special points used
  lastDeac: number; //timestamp player was put down or 0 if up
  currentHP: number; //current hit points
  maxHP: number; //max hit points
  resupplyShots: number; //shots received on resupply
  resupplyLives: number; //lives recevied on resupply
  shotPower: number; //hp per shot remvoed
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

const standardDefaults = {
  score: 0,
  missileOpponent: 0,
  missileTeam: 0,
  missileBase: 0,
  shotsHit: 0,
  shotsFired: 0,
  shotOpponent: 0,
  shotTeam: 0,
  shot3hit: 0,
  timesHit: 0,
  timesMissiled: 0,
  nukesActivated: 0,
  nukesDetonated: 0,
  nukeActive: false,
  oppNukeCancel: 0,
  ownNukeCancel: 0,
  medicHits: 0,
  nukeMedicHits: 0,
  ownMedicHits: 0,
  rapidFireActive: false,
  rapidFires: 0,
  ammoBoosts: 0,
  lifeBoosts: 0,
  penalties: 0,
  resupplyTeam: 0,
  ammoResupplies: 0,
  lifeResupplies: 0,
  doubleResupplies: 0,
  spEarned: 0,
  spSpent: 0,
  lastDeac: 0,
};

const positionDefaults = {
  Commander: {
    shotsLeft: 30,
    shotsMax: 60,
    resupplyShots: 5,
    livesLeft: 15,
    livesMax: 30,
    resupplyLives: 4,
    missilesLeft: 5,
    shotPower: 2,
    currentHP: 3,
    maxHP: 3,
    ...standardDefaults,
  },
  "Heavy Weapons": {
    shotsLeft: 20,
    shotsMax: 40,
    resupplyShots: 5,
    livesLeft: 10,
    livesMax: 20,
    resupplyLives: 3,
    missilesLeft: 5,
    shotPower: 3,
    currentHP: 3,
    maxHP: 3,
    ...standardDefaults,
  },
  Scout: {
    shotsLeft: 30,
    shotsMax: 60,
    resupplyShots: 10,
    livesLeft: 15,
    livesMax: 30,
    resupplyLives: 5,
    missilesLeft: 0,
    shotPower: 1,
    currentHP: 1,
    maxHP: 1,
    ...standardDefaults,
  },
  "Ammo Carrier": {
    shotsLeft: 15,
    shotsMax: 15,
    resupplyShots: 0,
    livesLeft: 10,
    livesMax: 20,
    resupplyLives: 3,
    missilesLeft: 0,
    shotPower: 1,
    currentHP: 1,
    maxHP: 1,
    ...standardDefaults,
  },
  Medic: {
    shotsLeft: 15,
    shotsMax: 30,
    resupplyShots: 5,
    livesLeft: 20,
    livesMax: 20,
    resupplyLives: 0,
    missilesLeft: 0,
    shotPower: 1,
    currentHP: 1,
    maxHP: 1,
    ...standardDefaults,
  },
};

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
        const gameActors = await connection.many(
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
        let currentState: GameState = Map<string, GameActor>(
          gameActors.map((actor) => {
            return [
              actor.iplId as string,
              {
                ...positionDefaults[actor.position as string],
                ...actor,
              } as GameActor,
            ];
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

  //hit or deac
  if (action.type === "0205" || action.type === "0206") {
    actor.score += 100;
    target.score -= 20;
    if (actor.position !== "Ammo Carrier")
      actor.shotsLeft = Math.max(0, actor.shotsLeft - 1);

    if (action.type === "0205") target.currentHP -= 1;

    if (action.type === "0206") {
      target.currentHP = 0;
      target.livesLeft = Math.max(0, target.livesLeft - 1);
      target.lastDeac = action.time;
    }
  }

  //miss
  if (action.type === "0201") {
    if (actor.position !== "Ammo Carrier")
      actor.shotsLeft = Math.max(0, actor.shotsLeft - 1);
  }

  //resupply shots
  if (action.type === "0500") {
    target.shotsLeft = Math.min(
      target.shotsMax,
      target.shotsLeft + target.resupplyShots
    );
  }

  //resupply lives
  if (action.type === "0502") {
    target.livesLeft = Math.min(
      target.livesMax,
      target.livesLeft + target.resupplyLives
    );
  }

  return nextState;
}
