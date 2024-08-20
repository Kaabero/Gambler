export interface Outcome {
  id: string,
  goals_home: number,
  goals_visitor: number,
  game?: Game
}

export interface User {
  id: string,
  username: string,
  password: string,
  admin: boolean,
  bets?: Bet[],
}

export interface Bet {
  id: string,
  goals_home: number,
  goals_visitor: number,
  game?: Game,
  user?: User
}

export interface Game {
    id: string,
    home_team: string,
    visitor_team: string,
    date: string,
    bets?: Bet[]
    outcome?: Outcome
  }

export type NewGame = Omit<Game, 'id'>
export type NewUser = Omit<User, 'id'>

export type Credentials = {
  username: string,
  token: string,
  admin: boolean,
  id: string,
  password: string
}

