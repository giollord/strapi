import { useCallback, useState } from 'react';
import { LocalConfig, LocalSettings } from '../../../shared/settings';
import { merge } from 'lodash';

export interface UseLocalConfigProps {
    contentTypeUid: string | undefined;
    groupField: string | undefined;
    groupName: string | undefined;
    localSettings?: LocalSettings;
    setLocalSettings: (newConfig: LocalSettings) => void;
    defaultConfig?: LocalConfig;
}

const useLocalConfig = (props: UseLocalConfigProps): [LocalConfig, (newConfig: LocalConfig) => void] => {
  const { contentTypeUid, groupField, groupName, localSettings, setLocalSettings } = props;
  let { defaultConfig } = props;

  if(!defaultConfig){
    defaultConfig = {
      chosenMediaField: '',
      chosenTitleField: '',
      chosenSubtitleField: '',
      rowHeight: 30,
    };
  }

  const localSettingsKey = `${contentTypeUid}/${groupField}/${groupName}`;
  const [localConfig, setLocalConfigState] = useState<LocalConfig>(localSettings?.configs?.[localSettingsKey] || defaultConfig);

  const setLocalConfig = useCallback((newConfig: LocalConfig) => {
    setLocalSettings(merge({}, localSettings, {
      configs: {
        [localSettingsKey]: newConfig,
      },
    } as LocalSettings));
    setLocalConfigState(newConfig);
  }, [localSettings, contentTypeUid, groupField, groupName]);

  return [localConfig, setLocalConfig];
};

export default useLocalConfig;