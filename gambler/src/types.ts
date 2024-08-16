export interface Outcome {
  id: number,
  goals_home: number,
  goals_visitor: number,
  game?: Game
}

export interface User {
  id: number,
  username: string,
  password: string,
  bets?: Bet[],
}

export interface Bet {
  id: number,
  goals_home: number,
  goals_visitor: number,
  game?: Game,
  user?: User
}

export interface Game {
    id: number,
    home_team: string,
    visitor_team: string,
    date: string,
    bets?: Bet[]
    outcome?: Outcome
  }


  
  export type NewGame = Omit<Game, 'id'>
