import { useLocalStorage } from "react-use";
import { LocalConfig, LocalSettings, OrderFieldConfiguration, Settings } from "../../../shared/settings";
import { LOCAL_SETTINGS_KEY } from "../../../shared/constants";
import { useParams } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import useCollectionTypes from "../hooks/useCollectionTypes";
import useLocalConfig from "../hooks/useLocalConfig";
import useGroupData from "../hooks/useGroupData";
import useAttributeData from "../hooks/useAttributeData";
import { Attribute } from '@strapi/types/dist/schema';
import { GroupResult, GroupResultMeta } from "../../../shared/contracts";
import useGroupNames from "../hooks/useGroupNames";
import { ContentTypeSchema } from "@strapi/types/dist/struct";
import useSettings from "../hooks/useSettings";

export const GroupAndArrangeContext = createContext<GroupAndArrangeContextValue & GroupAndArrangeContextSetters>(undefined!);

export interface GroupAndArrangeContextValue {
  isLoading: boolean;
  localSettings: LocalSettings | null;
  contentTypeUid: string | null;
  groupField: string | null;
  groupName: string | null;
  localConfigKey: string | null;
  localConfig: LocalConfig | null;
  chosenMediaField: string | null;
  chosenTitleField: string | null;
  chosenSubtitleField: string | null;
  chosenDirection: 'horizontal' | 'vertical' | null;
  mediaAttributeNames: string[];
  titleAttributeNames: string[];
  currentAttribute: (Attribute.AnyAttribute & {
    isOrder: boolean;
    isOrder2d: boolean;
  }) | null;
  currentCollectionType: ContentTypeSchema | null;
  currentFieldSettings: OrderFieldConfiguration | null;
  groupData: GroupResult | null;
  collectionTypes: ContentTypeSchema[] | null;
  groupNames: GroupResultMeta[] | null;
  globalSettings: Settings | null;
}

export interface GroupAndArrangeContextSetters {
  setLocalSettings: (newConfig: LocalSettings) => void;
  setLocalConfig: (config: any) => void;
  setChosenDirection: (direction: 'horizontal' | 'vertical' | null) => void;
}

/**
 * Provider for the GroupAndArrangeContext, holds pretty much all the state for the plugin
 */
export const GroupAndArrangeContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [localSettings, setLocalSettings] = useLocalStorage<LocalSettings>(LOCAL_SETTINGS_KEY, {
    configs: {},
  });
  const { uid: contentTypeUid, groupField, groupName } = useParams<{ uid: string, groupField: string, groupName: string }>();
  const { collectionTypes, isLoading: isLoadingCollectionTypes } = useCollectionTypes();
  const [localConfig, setLocalConfig] = useLocalConfig({ contentTypeUid, groupField, groupName, localSettings, setLocalSettings });
  const { groupData, isLoading: isLoadingGroupData } = useGroupData({ contentTypeUid, groupField, groupName });
  const { groupNames, isLoading: isFetchingGroupNames } = useGroupNames({ contentTypeUid });
  const { settings, isLoading: isFetchingSettings } = useSettings();

  const { chosenMediaField, chosenTitleField, chosenSubtitleField, mediaAttributeNames, titleAttributeNames, currentAttribute, currentCollectionType, currentFieldSettings } = useAttributeData({
    contentTypeUid,
    groupField,
    localConfig,
    collectionTypes
  });
  
  const [chosenDirection, setChosenDirection] = useState(currentFieldSettings?.order2dDirection);
  useEffect(() => {
    setChosenDirection(currentFieldSettings?.order2dDirection);
  }, [currentFieldSettings]);

  const localConfigKey =  contentTypeUid && groupField && groupName ? `${contentTypeUid}/${groupField}/${groupName}` : null;
  const isLoading = isLoadingCollectionTypes || isLoadingGroupData || isFetchingGroupNames || isFetchingSettings;

  const contextValue: GroupAndArrangeContextValue & GroupAndArrangeContextSetters = {
    isLoading,
    localSettings: localSettings || null,
    contentTypeUid: contentTypeUid || null,
    groupField: groupField || null,
    groupName: groupName || null,
    localConfigKey,
    localConfig: localConfig || null,
    chosenMediaField: chosenMediaField || null,
    chosenTitleField: chosenTitleField || null,
    chosenSubtitleField: chosenSubtitleField || null,
    chosenDirection: chosenDirection || null,
    mediaAttributeNames,
    titleAttributeNames,
    currentAttribute: currentAttribute || null,
    currentCollectionType: currentCollectionType || null,
    currentFieldSettings: currentFieldSettings || null,
    groupData: groupData || null,
    collectionTypes: collectionTypes || null,
    groupNames: groupNames || null,
    globalSettings: settings || null,
    setLocalSettings,
    setLocalConfig,
    setChosenDirection
  };

  return (
    <GroupAndArrangeContext.Provider value={contextValue}>
      {children}
    </GroupAndArrangeContext.Provider>
  );
};
