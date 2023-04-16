export interface Dataset {
  label: string;
  data: number[];
  backgroundColor?: string[];
  borderColor: string;
  borderWidth: number;
  borderRadius?: number;
  borderSkipped?: boolean;
  tension?: number;

}