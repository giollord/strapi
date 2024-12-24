import { useLocalStorage } from "react-use";
import { LocalConfig, LocalSettings, OrderFieldConfiguration } from "../../../shared/settings";
import { LOCAL_SETTINGS_KEY } from "../../../shared/constants";
import { useParams } from "react-router-dom";
import { createContext, useState } from "react";
import useCollectionTypes from "../hooks/useCollectionTypes";
import useLocalConfig from "../hooks/useLocalConfig";
import useGroupData from "../hooks/useGroupData";
import useAttributeData from "../hooks/useAttributeData";
import { Attribute } from '@strapi/types/dist/schema';
import { GroupResult, GroupResultName } from "../../../shared/contracts";
import useGroupNames from "../hooks/useGroupNames";
import { ContentTypeSchema } from "@strapi/types/dist/struct";

export const GroupAndArrangeContext = createContext<GroupAndArrangeContextValue & GroupAndArrangeContextSetters>(undefined!);

export interface GroupAndArrangeContextValue {
  isLoading: boolean;
  localSettings: LocalSettings | null;
  orderType: 'none' | '1d' | '2d';
  contentTypeUid: string | null;
  groupField: string | null;
  groupName: string | null;
  localConfigKey: string | null;
  localConfig: LocalConfig | null;
  chosenMediaField: string | null;
  chosenTitleField: string | null;
  mediaAttributeNames: string[];
  titleAttributeNames: string[];
  currentAttribute: (Attribute.AnyAttribute & {
    isOrder: boolean;
    isOrder2d: boolean;
}) | null;
  currentFieldSettings: OrderFieldConfiguration | null;
  groupData: GroupResult | null;
  collectionTypes: ContentTypeSchema[] | null;
  groupNames: GroupResultName[] | null;
}

export interface GroupAndArrangeContextSetters {
  setLocalSettings: (newConfig: LocalSettings) => void;
  setOrderType: (orderType: 'none' | '1d' | '2d') => void;
  setLocalConfig: (config: any) => void;
}

export const GroupAndArrangeContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [localSettings, setLocalSettings] = useLocalStorage<LocalSettings>(LOCAL_SETTINGS_KEY, {
    configs: {},
  });
  const [orderType, setOrderType] = useState('none' as 'none' | '1d' | '2d');
  const { uid: contentTypeUid, groupField, groupName } = useParams<{ uid: string, groupField: string, groupName: string }>();
  const { collectionTypes, isLoading: isLoadingCollectionTypes } = useCollectionTypes();
  const [localConfig, setLocalConfig] = useLocalConfig({ contentTypeUid, groupField, groupName, localSettings, setLocalSettings });
  const { groupData, isLoading: isLoadingGroupData } = useGroupData({ contentTypeUid, groupField, groupName });
  const { groupNames, isLoading: isFetchingGroupNames } = useGroupNames({ contentTypeUid });

  const { chosenMediaField, chosenTitleField, mediaAttributeNames, titleAttributeNames, currentAttribute, currentFieldSettings } = useAttributeData({
    contentTypeUid,
    groupField,
    localConfig,
    collectionTypes,
    setOrderType
  })

  const localConfigKey =  contentTypeUid && groupField && groupName ? `${contentTypeUid}/${groupField}/${groupName}` : null;
  const isLoading = isLoadingCollectionTypes || isLoadingGroupData || isFetchingGroupNames;

  const contextValue: GroupAndArrangeContextValue & GroupAndArrangeContextSetters = {
    isLoading,
    localSettings: localSettings || null,
    orderType,
    contentTypeUid: contentTypeUid || null,
    groupField: groupField || null,
    groupName: groupName || null,
    localConfigKey,
    localConfig: localConfig || null,
    chosenMediaField: chosenMediaField || null,
    chosenTitleField: chosenTitleField || null,
    mediaAttributeNames,
    titleAttributeNames,
    currentAttribute: currentAttribute || null,
    currentFieldSettings: currentFieldSettings || null,
    groupData: groupData || null,
    collectionTypes: collectionTypes || null,
    groupNames: groupNames || null,
    setLocalSettings,
    setOrderType,
    setLocalConfig,
  };

  return (
    <GroupAndArrangeContext.Provider value={contextValue}>
      {children}
    </GroupAndArrangeContext.Provider>
  );
};
