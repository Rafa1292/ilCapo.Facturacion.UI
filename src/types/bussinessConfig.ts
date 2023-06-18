import { tableProps } from './tableProps'

export interface BussinessConfig {
  id: number;
  menuWaitTime: number;
  serveWaitTime: number;
  tables: tableProps[];
}