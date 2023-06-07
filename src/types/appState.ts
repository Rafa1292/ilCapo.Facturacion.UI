import { User } from './user'
import { UserInfo } from './userInfo'
import { WorkDayUser } from './workDayUser'

export interface appState {
  system: systemState;
  user: userState;
  login: (tmpUser: User) => void;
  setWorkDayUser: () => void;
  logout: () => void;
}

export interface userState {
  loggedIn: boolean;
  userInfo: UserInfo,
  workDayUser: WorkDayUser;
}

export interface systemState {
  loader: boolean;
}
