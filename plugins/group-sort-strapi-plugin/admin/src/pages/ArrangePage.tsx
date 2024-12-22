import { Box, Button, DesignSystemProvider, Field, Flex, Grid, Main, NumberInput, SingleSelect, SingleSelectOption, StrapiTheme, TypographyComponent } from '@strapi/design-system';
import { Typography } from '@strapi/design-system';
import { FormattedMessage, useIntl } from 'react-intl';
import { useTranslation } from '../utils/useTranslation';
import GridLayout, { Responsive, WidthProvider } from "react-grid-layout";

import styled from 'styled-components';
import { Layouts, Page, useFetchClient } from '@strapi/strapi/admin';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Struct } from '@strapi/types';
import { LeftMenu } from '../components/LeftMenu';
import { Check, GridFour } from '@strapi/icons';
import withReactGridStyles from './ArrangePage.Styles';
import { LocalConfig, LocalSettings, OrderFieldConfiguration } from '../../../shared/settings'
import { useLocalStorage } from 'react-use';
import { LOCAL_SETTINGS_KEY, PLUGIN_ID } from '../../../shared/constants';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { get, merge } from 'lodash';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SortableItem } from '../components/SortableItem';
import { GroupResult } from '../../../shared/contracts';
import { c } from 'tar';

// DocumentVersion

const StyledResponsiveGridLayout = withReactGridStyles(WidthProvider(GridLayout));

const GridItem = ({ children }: { children: React.ReactNode }) => (
  <Grid.Item xs={12} s={6} m={4}>{children}</Grid.Item>
);

const GridRoot = styled(Grid.Root)`
  align-items: flex-start;
`;

const ArrangePage = () => {
  const { formatMessage } = useTranslation();
  const { formatMessage: formatMessageIntl } = useIntl();

  let {uid, groupField, groupName} = useParams<{uid: string, groupField: string, groupName: string}>();

  const [localSettings, setLocalSettings] = useLocalStorage<LocalSettings>(LOCAL_SETTINGS_KEY, {
    configs: {},
  });
  const localSettingsKey = `${uid}/${groupField}/${groupName}`;
  const currentLocalSettings = localSettings?.configs?.[localSettingsKey];
  const updateLocalSettings = useCallback((newSettings: LocalConfig) => {
    setLocalSettings(merge({}, localSettings, {
      configs: {
        [localSettingsKey]: newSettings,
      },
    } as LocalSettings));
  }, [localSettings, setLocalSettings, uid, groupField, groupName]);

  const [chosenMediaField, setChosenMediaField] = useState<string | undefined>(currentLocalSettings?.chosenMediaField);
  const [chosenTitleField, setChosenTitleField] = useState<string | undefined>(currentLocalSettings?.chosenTitleField);
  useEffect(() => {
    setChosenMediaField(currentLocalSettings?.chosenMediaField);
    setChosenTitleField(currentLocalSettings?.chosenTitleField);
  }, [localSettings, uid, groupField, groupName]);
  
  const fetchClient = useFetchClient();
  const { data: collectionTypes, isLoading: isFetchingContentTypes } = useQuery({
    queryKey: [PLUGIN_ID, 'contentTypes'],
    async queryFn() {
      const result = await fetchClient.get('/content-manager/content-types');
      const allCollectionTypes = result.data.data as Struct.ContentTypeSchema[];

      const filteredCollectionTypes = allCollectionTypes
        .filter((collectionType: any) =>
          collectionType.isDisplayed &&
          collectionType.kind === 'collectionType');
      return filteredCollectionTypes;
    },
  });
  const currentCollectionType = collectionTypes?.find((collectionType) => collectionType.uid === uid);
  const mediaAttributeNames = Object.keys(currentCollectionType?.attributes || {}).filter((attributeName) => {
    const attribute = currentCollectionType?.attributes[attributeName];
    return attribute?.type === 'media';
  });
  const titleAttributeNames = Object.keys(currentCollectionType?.attributes || {}).filter((attributeName) => {
    const attribute = currentCollectionType?.attributes[attributeName];
    return attribute?.type === 'string';
  });

  const currentAttribute = Object.keys(currentCollectionType?.attributes || {}).map((attributeName) => {
    const attribute = currentCollectionType?.attributes[attributeName];
    if(attributeName !== groupField) {
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
  const currentFieldSettings = (currentAttribute as any)?.options.group as OrderFieldConfiguration;

  const {data: groupData, isLoading: isFetchingGroups} = useQuery({
    queryKey: [PLUGIN_ID, 'groups', uid, groupField, groupName],
    async queryFn() {
      const result = await fetchClient.get(`/${PLUGIN_ID}/groups/${uid}/${groupField}/${groupName}`);
      return result.data as GroupResult;
    }
  });
  
  const [itemsDictionary, setItemsDictionary] = useState({} as Record<string, any>);
  const [sortables, setSortables] = useState([] as string[]);
  useEffect(() => {
    const itemsDictionary = (groupData?.items || []).reduce((acc: Record<string, any>, item) => {
      acc[item.documentId] = {
        ...item,
        thumbnailUrisByMediaFields: mediaAttributeNames.reduce((mediaAcc: Record<string, string>, mediaAttributeName) => {
          const media = item[mediaAttributeName];
          let mediaUrl = Array.isArray(media) ? media[0]?.url : media?.url;
          mediaUrl = get(media, ['formats', 'small', 'url']) || mediaUrl;
          mediaUrl = get(media, ['formats', 'thumbnail', 'url']) || mediaUrl;

          if (mediaUrl) {
            mediaAcc[mediaAttributeName] = mediaUrl;
          }
          return mediaAcc;
        }, {}),
        titlesByTitleFields: titleAttributeNames.reduce((titleAcc: Record<string, string>, titleAttributeName) => {
          titleAcc[titleAttributeName] = item[titleAttributeName];
          return titleAcc;
        }, {})
      };
      return acc;
    }, {});
    setSortables(Object.keys(itemsDictionary));
    setItemsDictionary(itemsDictionary);
  }, [groupData, collectionTypes]);

  const MainBox = styled.div`
    margin: ${({ theme }) => (theme as StrapiTheme).spaces[4]};
    padding: ${({ theme }) => (theme as StrapiTheme).spaces[6]};
    background-color: ${({ theme }) => (theme as StrapiTheme).colors.neutral0};
  `;

  const GridFourCustom = styled(GridFour)`
    margin-right: ${({ theme }) => (theme as StrapiTheme).spaces[2]};
    width: ${({ theme }) => (theme as StrapiTheme).spaces[6]};
    height: ${({ theme }) => (theme as StrapiTheme).spaces[6]};
  `;
  
  const layout = [
    { i: "a", x: 0, y: 0, w: 1, h: 2, static: true },
    { i: "b", x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
    { i: "c", x: 4, y: 0, w: 1, h: 2 }
  ];
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isLoading = isFetchingContentTypes || isFetchingGroups;

  if (isLoading) {
    return <Page.Loading />;
  }

  function handleDragEnd(event: DragEndEvent): void {
    const {active, over} = event;
    
    if (active.id !== over?.id) {
      setSortables((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over?.id as string);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <Layouts.Root sideNav={<LeftMenu collectionTypes={collectionTypes} />}>
      <Layouts.Header
        title={formatMessage({
          id: 'plugin.name',
          defaultMessage: 'Group and Arrange',
        })}
        primaryAction={
          <Flex gap={2}>
            <Button
              disabled={isLoading}
              //loading={isSubmitting}
              startIcon={<Check />}
              type="submit"
              size="S"
            >
              {formatMessageIntl({
                id: 'global.save',
                defaultMessage: 'Save',
              })}
            </Button>
          </Flex>} />
      <Main>
        <MainBox>
          <Flex direction="column" alignItems="stretch" gap={4}>
            <GridRoot gap={4}>
              <GridItem>
                <Field.Root
                    hint={formatMessage({
                      id: 'arrange.media-select.hint',
                      defaultMessage: 'Option controls what media field will be displayed as items preview in the group. Only affects current user.',
                    })}
                    width="100%">
                  <Field.Label>
                    {formatMessage({
                      id: 'arrange.media-select.label',
                      defaultMessage: 'Media field to display',
                    })}
                  </Field.Label>
                  <SingleSelect
                    placeholder={formatMessage({
                      id: 'arrange.media-select.placeholder',
                      defaultMessage: 'Choose media field',
                    })}
                    value={chosenMediaField || ''}
                    onChange={(value) => {
                      updateLocalSettings({
                        ...currentLocalSettings!,
                        chosenMediaField: value.toString()
                      })}}
                      >
                    {mediaAttributeNames.concat(['']).map((mediaAttributeName) => (
                      <SingleSelectOption
                        key={mediaAttributeName}
                        value={mediaAttributeName}>
                        {mediaAttributeName || formatMessage({
                          id: 'arrange.empty-item',
                          defaultMessage: '<Empty>',
                        })}
                      </SingleSelectOption>
                    ))}
                  </SingleSelect>
                  <Field.Hint />
                </Field.Root>
              </GridItem>
              <GridItem>
                <Field.Root
                    hint={formatMessage({
                      id: 'arrange.title-select.hint',
                      defaultMessage: 'Option controls what text field will be used to display titles. Only affects current user.',
                    })}
                    width="100%">
                  <Field.Label>
                    {formatMessage({
                      id: 'arrange.title-select.label',
                      defaultMessage: 'Title field to display',
                    })}
                  </Field.Label>
                  <SingleSelect
                    placeholder={formatMessage({
                      id: 'arrange.title-select.placeholder',
                      defaultMessage: 'Choose title field',
                    })}
                    value={chosenTitleField || ''}
                    onChange={(value) => {
                      updateLocalSettings({
                        ...currentLocalSettings!,
                        chosenTitleField: value.toString()
                      })}}
                      >
                    {titleAttributeNames.concat(['']).map((titleAttributeName) => (
                      <SingleSelectOption
                        key={titleAttributeName}
                        value={titleAttributeName}>
                        {titleAttributeName || formatMessage({
                          id: 'arrange.empty-item',
                          defaultMessage: '<Empty>',
                        })}
                      </SingleSelectOption>
                    ))}
                  </SingleSelect>
                  <Field.Hint />
                </Field.Root>
              </GridItem>
              <GridItem>
                <Field.Root
                    hint={formatMessage({
                      id: 'arrange.row-height.hint',
                      defaultMessage: 'Controls visual display of rows in the group. Only affects current user.',
                    })}
                    width="100%">
                  <Field.Label>
                    {formatMessage({
                      id: 'arrange.row-height.label',
                      defaultMessage: 'Row height, px',
                    })}
                  </Field.Label>
                  <NumberInput
                    value={currentLocalSettings?.rowHeight || 30}
                    onValueChange={(value: number | undefined): void => {
                      updateLocalSettings({
                        ...currentLocalSettings!,
                        rowHeight: value!
                      });
                    }}
                    placeholder={formatMessage({
                      id: 'arrange.row-height.placeholder',
                      defaultMessage: 'Choose row height, px'
                    })}
                    />
                  <Field.Hint />
                </Field.Root>
              </GridItem>
            </GridRoot>
            { currentAttribute?.isOrder && (chosenTitleField || chosenMediaField) &&
              <Grid.Root gap={4} gridCols={currentFieldSettings?.columnsNumber} flex={1}>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortables}
                    strategy={rectSortingStrategy}
                  >
                    {sortables.map(x => itemsDictionary[x]).map(i => 
                      <Grid.Item key={i.documentId} col={1} m={1}>
                        <SortableItem id={i.documentId}
                          title={chosenTitleField && i.titlesByTitleFields[chosenTitleField]}
                          subtitle=''
                          thumbnailUri={chosenMediaField && i.thumbnailUrisByMediaFields[chosenMediaField]} />
                      </Grid.Item>
                    )}
                  </SortableContext>
                </DndContext>
              </Grid.Root>
            }
            { currentAttribute?.isOrder2d &&
              <Box position="relative" width="100%">
                <StyledResponsiveGridLayout
                  className="layout"
                  layout={layout}
                  cols={currentFieldSettings.columnsNumber}
                  rowHeight={currentLocalSettings?.rowHeight || 30}
                  compactType={null}
                >
                  <div key="a" style={{backgroundColor: "blue"}}>a</div>
                  <div key="b" style={{backgroundColor: "aqua"}}>b</div>
                  <div key="c" style={{backgroundColor: "green"}}>c</div>
                </StyledResponsiveGridLayout>
              </Box>
            }
          </Flex>
        </MainBox>
      </Main>
    </Layouts.Root>
  );
};

export default ArrangePage;
