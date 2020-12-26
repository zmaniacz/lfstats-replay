export interface HashTable<T> {
  [index: string]: T;
}

export interface GameAction {
  id: number;
  time: number;
  type: string;
  text: string;
  gameId: number;
  state: object;
  actorId: number;
  actorIpl: string;
  actorColor: string;
  actorColorEnum: number;
  actorName: string;
  actorTeamIndex: number;
  targetId: string;
  targetIpl: string;
  targetColor: string;
  targetColorEnum: number;
  targetName: string;
  targetTeamIndex: number;
  genIpl: string;
  genName: string;
  genColor: string;
}
