import { Struct } from '@strapi/strapi';
import { LocalConfig, OrderFieldConfiguration } from '../../../shared/settings';
import { PLUGIN_ID } from '../../../shared/constants';
import { Attribute } from '@strapi/types/dist/schema';
import { useEffect, useState } from 'react';

export interface UseAttributeNamesParams {
  contentTypeUid: string | undefined,
  groupField?: string | undefined,
  localConfig: LocalConfig,
  collectionTypes: Struct.ContentTypeSchema[] | undefined,
  setOrderType: (orderType: 'none' | '1d' | '2d') => void;
}

export const useAttributeData = (props: UseAttributeNamesParams) => {
  const { contentTypeUid, groupField, localConfig, collectionTypes, setOrderType } = props;

  const [chosenMediaField, setChosenMediaField] = useState<string | undefined>(undefined);
  const [chosenTitleField, setChosenTitleField] = useState<string | undefined>(undefined);
  const [mediaAttributeNames, setMediaAttributeNames] = useState<string[]>([]);
  const [titleAttributeNames, setTitleAttributeNames] = useState<string[]>([]);
  const [currentAttribute, setCurrentAttribute] = useState<(Attribute.AnyAttribute & { isOrder: boolean, isOrder2d: boolean }) | null>(null);
  const [currentFieldSettings, setCurrentFieldSettings] = useState<OrderFieldConfiguration | undefined>(undefined);

  useEffect(() => {
    const collectionType = collectionTypes?.find((collectionType) => collectionType.uid === contentTypeUid);
    setChosenMediaField(localConfig?.chosenMediaField);
    setChosenTitleField(localConfig?.chosenTitleField);

    if (collectionType) {
      const mediaNames = Object.keys(collectionType.attributes || {}).filter((attributeName) => {
        const attribute = collectionType.attributes[attributeName];
        return attribute?.type === 'media';
      });
      setMediaAttributeNames(mediaNames);

      const titleNames = Object.keys(collectionType.attributes || {}).filter((attributeName) => {
        const attribute = collectionType.attributes[attributeName];
        return attribute?.type === 'string';
      });
      setTitleAttributeNames(titleNames);

      const currentAttr = Object.keys(collectionType.attributes || {}).map((attributeName) => {
        const attribute = collectionType.attributes[attributeName];
        if (!attribute || !groupField || attributeName !== groupField) {
          return null;
        }
        const isOrder = (attribute as any)?.customField === `plugin::${PLUGIN_ID}.order`;
        const isOrder2d = (attribute as any)?.customField === `plugin::${PLUGIN_ID}.order2d`;
        return {
          ...attribute,
          isOrder,
          isOrder2d
        };
      }).filter((x) => x)[0];

      setCurrentAttribute(currentAttr);
      setCurrentFieldSettings((currentAttr as any)?.options.group as OrderFieldConfiguration);
      setOrderType(currentAttr?.isOrder ? '1d' : currentAttr?.isOrder2d ? '2d' : 'none');
    }
  }, [contentTypeUid, groupField, localConfig, collectionTypes]);

  return {
    mediaAttributeNames,
    titleAttributeNames,
    chosenMediaField,
    chosenTitleField,
    currentAttribute,
    currentFieldSettings
  };
};

export default useAttributeData;
