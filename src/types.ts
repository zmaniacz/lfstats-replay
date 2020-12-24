export interface HashTable<T> {
  [index: string]: T;
}

export interface GameAction {
  id: number;
  player_id: number;
  player_name: string;
  target_id: number;
  target_name: string;
  player_color: string;
  target_color: string;
  action_text: string;
  action_time: number;
  action_type: string;
  game_id: number;
  state: object;
  icon?: string;
}
