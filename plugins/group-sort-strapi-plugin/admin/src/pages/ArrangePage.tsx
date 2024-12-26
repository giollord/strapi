import { Box, Button, Flex, Grid, Main, StrapiTheme } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { useTranslation } from '../hooks/useTranslation';
import GridLayout, { WidthProvider } from "react-grid-layout";

import styled from 'styled-components';
import { Layouts, Page, useFetchClient, useNotification } from '@strapi/strapi/admin';
import { useContext, useEffect, useState } from 'react';

import { LeftMenu } from '../components/LeftMenu';
import { Check } from '@strapi/icons';
import withReactGridStyles from './ArrangePage.Styles';
import { get, isEqual, differenceWith } from 'lodash';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SortableItem } from '../components/ArrangePage/SortableItem';
import { UserSettings } from '../components/ArrangePage/UserSettings';
import { GroupAndArrangeContext } from '../components/GroupAndArrangeContextProvider';
import { useBlocker } from 'react-router-dom';


const StyledResponsiveGridLayout = withReactGridStyles(WidthProvider(GridLayout));

const StyledUserSettings = styled(UserSettings)`
  align-items: flex-start;
`;

const MainBox = styled(Box)`
  margin: ${({ theme }) => (theme as StrapiTheme).spaces[4]};
  padding: ${({ theme }) => (theme as StrapiTheme).spaces[6]};
  background-color: ${({ theme }) => (theme as StrapiTheme).colors.neutral0};
`;

const ArrangePage = () => {
  const { formatMessage } = useTranslation();
  const { formatMessage: formatMessageIntl } = useIntl();
  const fetchClient = useFetchClient();
  const { toggleNotification } = useNotification();

  const {
    contentTypeUid,
    groupField,
    groupName,
    groupData,
    currentAttribute,
    currentFieldSettings,
    mediaAttributeNames,
    titleAttributeNames,
    chosenMediaField,
    chosenTitleField,
    localConfig,
    currentCollectionType,
    collectionTypes,
    isLoading
  } = useContext(GroupAndArrangeContext);
  if (!contentTypeUid || !groupField || !groupName) {
    return <Page.Error />;
  }

  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    setIsModified(false);
    setIsSaving(false);
  }, [contentTypeUid, groupField, groupName]);

  const [itemsDictionary, setItemsDictionary] = useState({} as Record<string, any>);
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

    setItemsDictionary(itemsDictionary);
    if (currentAttribute?.isOrder) {
      // Prepare sortables for 1-dimensional list.
      // Items that does not have order yet will be placed at the end of the list.
      const sortables: {order: number, documentId: string}[] = groupData?.items.reduce((acc: {order: number, documentId: string}[], item) => {
        const order = item[groupField] || acc.length - 1;
        acc.push({ order, documentId: item.documentId });
        return acc;
      }, []) || [];
      sortables.sort((a, b) => a.order - b.order);
      setSortables(sortables.map(x => x.documentId));
    }
    if (currentAttribute?.isOrder2d && currentFieldSettings) {
      // Prepare layout2d for 2-dimensional grid.
      // Items that does not have order yet will be placed at the end of the grid starting from the last available coordinate.
      const sortables: {order: GridLayout.Layout | null, documentId: string}[] = 
        groupData?.items
          .reduce((acc: {order: GridLayout.Layout | null, documentId: string}[], item) => {
            const order = item[groupField];
            acc.push({ order: order || null, documentId: item.documentId });
            return acc;
          }, [])
          .map(x => {
            // attach documetId since it is not part of the order object
            return { order: x.order && {...x.order, i: x.documentId} as GridLayout.Layout, documentId: x.documentId }
          }) || [];
      
      const resultingSortables = sortables.filter(x => x.order).map(x => x.order as GridLayout.Layout);
      const idsMissingOrder = sortables.filter(x => !x.order).map(x => x.documentId);
      if(idsMissingOrder.length > 0) {
        const lastPosition = {x:0, y:0};
        sortables.forEach(i => {
          if(i.order)
          {
            lastPosition.x = Math.max(lastPosition.x, i.order.x + i.order.w);
            lastPosition.y = Math.max(lastPosition.y, i.order.y + i.order.h);
          }
        });
        for(let i = 0; i < idsMissingOrder.length; i++)
        {
          const id = idsMissingOrder[i];
          const x = (i + lastPosition.x) % currentFieldSettings.columnsNumber;
          const y = Math.floor((i + lastPosition.x) / currentFieldSettings.columnsNumber);

          const layout: GridLayout.Layout = {
            i: id,
            x: x,
            y: lastPosition.y + y,
            w: 1,
            h: 1
          }
          resultingSortables.push(layout);
        }
      }
      setLayout2d(resultingSortables.map(x => ({
        ...x,
        // these are needed for checking whether changes were made in handleLayout2dChange:
        moved: false,
        static: false,
        isBounded: undefined,
        isDraggable: undefined,
        isResizable: undefined,
        maxH: undefined,
        maxW: undefined,
        minH: undefined,
        minW: undefined,
        resizeHandles: undefined
      })));
    }

  }, [groupData, collectionTypes, currentAttribute, currentFieldSettings]);
  const [sortables, setSortables] = useState([] as string[]);
  const [layout2d, setLayout2d] = useState([] as GridLayout.Layout[]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSortables((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over?.id as string);

        setIsModified(true);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
  function handleLayout2dChange(layout: GridLayout.Layout[]): void {
    if(!isModified) {
      const wasChanged = differenceWith(layout, layout2d, isEqual).length > 0;
      if (!wasChanged) {
        return;
      }
      setIsModified(true);
    }
    setLayout2d(layout);
  }

  async function handleSave(): Promise<void> {
    setIsSaving(true);

    if (currentAttribute?.isOrder) {
      const currentValues = sortables.map((documentId, index) => ({ documentId, index }));
      for (const { documentId, index } of currentValues) {
        await fetchClient.put(`/content-manager/collection-types/${currentCollectionType?.uid}/${documentId}`, {
          [groupField!]: index
        });
      }
    }
    if (currentAttribute?.isOrder2d) {
      for (const item of layout2d) {
        await fetchClient.put(`/content-manager/collection-types/${currentCollectionType?.uid}/${item.i}`, {
          [groupField!]: {
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h
          }
        });
      }
    }

    setIsModified(false);
    setIsSaving(false);

    toggleNotification({
      type: 'success',
      message: formatMessage({
        id: 'arrange.saved',
        defaultMessage: 'Changes saved',
      }),
    })
  }

  useBlocker(() => {
    if(isModified)
    {
      const confirmation = confirm(formatMessage({
        id: 'arrange.unsaved-changes',
        defaultMessage: 'You have unsaved changes. Are you sure you want to leave?'
      }));
      return !confirmation;
    }
    return false;
  });

  if (isLoading || !currentFieldSettings || isSaving) {
    return <Page.Loading />;
  }

  return (
    <Layouts.Root sideNav={<LeftMenu />}>
      <Layouts.Header
        title={formatMessage({
          id: 'plugin.name',
          defaultMessage: 'Group and Arrange',
        })}
        primaryAction={
          <Flex gap={2}>
            <Button
              disabled={isLoading || !isModified}
              loading={isSaving}
              startIcon={<Check />}
              onClick={handleSave}
              size="S"
            >
              {formatMessageIntl({
                id: 'global.save',
                defaultMessage: 'Save',
              })}
            </Button>
          </Flex>} />
      <Main style={{ marginTop: "-24px" }}>
        <MainBox>
          <Flex direction="column" alignItems="stretch" gap={4}>
            <StyledUserSettings />
            {currentAttribute?.isOrder &&
              <Grid.Root gap={4} gridCols={currentFieldSettings.columnsNumber} flex={1}>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortables}
                    strategy={rectSortingStrategy}
                  >
                    {sortables.map(x => itemsDictionary[x]).filter(x => x).map(i =>
                      <Grid.Item key={i.documentId} col={1} m={1}>
                        <SortableItem
                          id={i.documentId}
                          title={chosenTitleField && i.titlesByTitleFields[chosenTitleField]}
                          subtitle=''
                          thumbnailUri={chosenMediaField && i.thumbnailUrisByMediaFields[chosenMediaField]}
                          resizable={false} />
                      </Grid.Item>
                    )}
                  </SortableContext>
                </DndContext>
              </Grid.Root>
            }
            {currentAttribute?.isOrder2d &&
              <Box position="relative" width="100%">
                <StyledResponsiveGridLayout
                  className="layout"
                  layout={layout2d}
                  onLayoutChange={handleLayout2dChange}
                  cols={currentFieldSettings.columnsNumber}
                  rowHeight={localConfig?.rowHeight || 30}
                  compactType={currentFieldSettings?.order2dDirection || null}
                >
                  {layout2d.map(x => itemsDictionary[x.i]).filter(x => x).map(i =>
                    <Grid.Item key={i.documentId} col={1} m={1}>
                      <SortableItem
                        id={i.documentId}
                        title={chosenTitleField && i.titlesByTitleFields[chosenTitleField]}
                        subtitle=''
                        thumbnailUri={chosenMediaField && i.thumbnailUrisByMediaFields[chosenMediaField]}
                        resizable={true} />
                    </Grid.Item>
                  )}
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
