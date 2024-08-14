export interface Game {
    id: number,
    home_team: string,
    visitor_team: string,
    date: string,
    outcome_added: boolean
  }
  
  export type NewGame = Omit<Game, 'id'>