import { User } from './user'
import { WorkDayUser } from './workDayUser'

export interface appState {
  system: systemState;
  user: userState;
  login: () => void;
  setWorkDayUser: () => void;
  logout: () => void;
}

export interface userState {
  loggedIn: boolean;
  user: User,
  workDayUser: WorkDayUser;
}

export interface systemState {
  loader: boolean;
}
