import { Bill } from './bill'
import { BillFunctions } from './billFunctions'
import { BussinessConfig } from './bussinessConfig'
import { User } from './user'
import { UserInfo } from './userInfo'
import { WorkDayUser } from './workDayUser'

export interface appState {
  system: systemState;
  user: userState;
  login: (tmpUser: User) => void;
  setWorkDayUser: () => Promise<WorkDayUser | undefined>;
  logout: () => void;
  setRoomEdit: (value: boolean) => void;
  setMenuDeliveryTime: (tableNumber: number, date: Date | null) => void;
  getBussinessConfig: () => void;
  billFunctions: BillFunctions;
}

export interface userState {
  loggedIn: boolean;
  userInfo: UserInfo,
  workDayUser: WorkDayUser;
}

export interface systemState {
  loader: boolean;
  roomEdit: boolean;
  bussinessConfig: BussinessConfig;
}
