export interface Outcome {
  id: string,
  goals_home: string,
  goals_visitor: string,
  game: Game
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
  goals_home: string,
  goals_visitor: string,
  game: Game,
  user: User
}

export interface Game {
    id: string,
    home_team: string,
    visitor_team: string,
    date: Date,
    bets?: Bet[],
    outcome?: Outcome
}

export interface Scores {
  id: string,
  points: string,
  user: User,
  outcome: Outcome
} 

export type NewGame = Omit<Game, 'id'>
export type NewUser = Omit<User, 'id'>


export interface NewOutcome {
  goals_home: string,
  goals_visitor: string,
  game: string,
}

export interface NewBet {
  goals_home: string,
  goals_visitor: string,
  game: string,
  user?: string,
}

export interface NewScores {
  id: string,
  points: string,
  user?: string,
  outcome?: string
} 


export type Credentials = {
  username: string,
  token: string,
  admin: boolean,
  id: string,
  password: string
}