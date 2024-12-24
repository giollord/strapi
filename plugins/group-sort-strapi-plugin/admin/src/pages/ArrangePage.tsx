import { Box, Button, Flex, Grid, Main, StrapiTheme } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { useTranslation } from '../hooks/useTranslation';
import GridLayout, { WidthProvider } from "react-grid-layout";

import styled from 'styled-components';
import { Layouts, Page } from '@strapi/strapi/admin';
import { useContext, useEffect, useState } from 'react';

import { LeftMenu } from '../components/LeftMenu';
import { Check } from '@strapi/icons';
import withReactGridStyles from './ArrangePage.Styles';
import { get } from 'lodash';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SortableItem } from '../components/ArrangePage/SortableItem';
import { UserSettings } from '../components/ArrangePage/UserSettings';
import { GroupAndArrangeContext } from '../components/GroupAndArrangeContextProvider';


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

  const { contentTypeUid, groupField, groupName, orderType, mediaAttributeNames, titleAttributeNames, groupData, currentAttribute, currentFieldSettings, isLoading, chosenMediaField, chosenTitleField, localConfig, collectionTypes } = useContext(GroupAndArrangeContext);
  if(!contentTypeUid || !groupField || !groupName) {
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
      setSortables(Object.keys(itemsDictionary));
    }
    if(currentAttribute?.isOrder2d) {
      const layout2d = (groupData?.items || []).map((item, index): GridLayout.Layout => ({
        i: item.documentId,
        x: 1,
        y: 1,
        w: 1,
        h: 1,
      }));
      setLayout2d(layout2d);
    }
    
  }, [groupData, collectionTypes, currentAttribute]);
  const [sortables, setSortables] = useState([] as string[]);
  const [layout2d, setLayout2d] = useState([] as GridLayout.Layout[]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (isLoading || !currentFieldSettings) {
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

  function handleSave(): void {
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
      <Main style={{ marginTop: "-24px"}}>
        <MainBox>
          <Flex direction="column" alignItems="stretch" gap={4}>
            <StyledUserSettings />
            { orderType === '1d' && (chosenTitleField || chosenMediaField) &&
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
                    {sortables.map(x => itemsDictionary[x]).map(i => 
                      <Grid.Item key={i.documentId} col={1} m={1}>
                        <SortableItem
                          id={i.documentId}
                          title={chosenTitleField && i.titlesByTitleFields[chosenTitleField]}
                          subtitle=''
                          thumbnailUri={chosenMediaField && i.thumbnailUrisByMediaFields[chosenMediaField]}
                          keep1to1AspectRatio={true} />
                      </Grid.Item>
                    )}
                  </SortableContext>
                </DndContext>
              </Grid.Root>
            }
            { orderType === '2d' &&
              <Box position="relative" width="100%">
                <StyledResponsiveGridLayout
                  className="layout"
                  layout={layout2d}
                  onLayoutChange={setLayout2d}
                  cols={currentFieldSettings.columnsNumber}
                  rowHeight={localConfig?.rowHeight || 30}
                  compactType={null}
                >
                  {layout2d.map(x => itemsDictionary[x.i]).map(i => 
                    <Grid.Item key={i.documentId} col={1} m={1}>
                      <SortableItem
                        id={i.documentId}
                        title={chosenTitleField && i.titlesByTitleFields[chosenTitleField]}
                        subtitle=''
                        thumbnailUri={chosenMediaField && i.thumbnailUrisByMediaFields[chosenMediaField]}
                        keep1to1AspectRatio={false} />
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
