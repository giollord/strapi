/**
 * Global plugin settings, not used at the moment
 */
export interface Settings {
  horisontalDivisions: number;
}

/**
 * User settings, stored in localStorage, contains configurations per content type
 */
export interface LocalSettings {
  configs: Record<string, LocalConfig>;
}

/**
 * User settings, stored in localStorage for specific content type
 */
export interface LocalConfig {
  chosenMediaField: string;
  chosenTitleField: string;
  chosenSubtitleField: string;
  rowHeight: number;
}

/**
 * Order content field configuration
 */
export interface OrderFieldConfiguration {
  groupField: string;
  columnsNumber: number;
  order2dDirection: 'horizontal' | 'vertical' | null;
}