import { Dataset } from './dataset'

export interface ChartData {
  title: string;
  labels: string[];
  datasets: Dataset[];
}