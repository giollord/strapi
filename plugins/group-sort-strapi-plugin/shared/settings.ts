export interface Settings {
  horisontalDivisions: number;

  // TODO: Configure horisontal/vertical divisions in content type itself
}

export interface LocalConfig {
  chosenMediaField: string;
  chosenTitleField: string;
  chosenSubtitleField: string;
  rowHeight: number;
}

export interface LocalSettings {
  configs: Record<string, LocalConfig>;
}

export interface OrderFieldConfiguration {
  groupField: string;
  columnsNumber: number;
  order2dDirection: 'horizontal' | 'vertical' | null;
}