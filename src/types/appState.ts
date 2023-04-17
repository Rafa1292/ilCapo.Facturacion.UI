export interface appState {
  system: systemState;
  user: userState;
  login: () => void;
}

export interface userState {
  loggedIn: boolean;
}

export interface systemState {
  loader: boolean;
}
