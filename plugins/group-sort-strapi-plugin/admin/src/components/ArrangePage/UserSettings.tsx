import { Field, Grid, NumberInput, SingleSelect, SingleSelectOption } from '@strapi/design-system';
import React, { ReactNode, useContext } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { GroupAndArrangeContext } from '../GroupAndArrangeContextProvider';
import { GridDirection } from '../../../../shared/types';

const GridItem = ({ children }: { children: React.ReactNode }) => (
  <Grid.Item xs={12} s={6} m={4}>{children}</Grid.Item>
);

interface SelectFieldProps {
  chosenField: string | null | undefined;
  setChosenField: (newField: string) => void;
  attributeNames: string[];
  hintContent: string | ReactNode;
  labelContent: string | ReactNode;
  placeholderContent: string | ReactNode;
  emptyItemContent: string | ReactNode | null;
}

const SelectField = (props: SelectFieldProps) => {
  const {
    chosenField,
    setChosenField,
    attributeNames,
    hintContent,
    labelContent,
    placeholderContent,
    emptyItemContent
  } = props

  return (
    <Field.Root
      hint={hintContent}
      width="100%">
      <Field.Label>
        {labelContent}
      </Field.Label>
      <SingleSelect
        placeholder={placeholderContent}
        value={chosenField || ''}
        onChange={s => setChosenField(s.toString())}
      >
        {attributeNames.concat(emptyItemContent ? [''] : []).map((attributeName) => (
          <SingleSelectOption
            key={attributeName}
            value={attributeName}>
            {attributeName || emptyItemContent}
          </SingleSelectOption>
        ))}
      </SingleSelect>
      <Field.Hint />
    </Field.Root>);
}

/**
 * UserSettings component, used in ArrangePage to display user settings for the plugin: chosen media and title fields, row height for 2d order
 */
export const UserSettings = () => {
  const { formatMessage } = useTranslation();
  const { chosenMediaField, chosenTitleField, chosenDirection, mediaAttributeNames, titleAttributeNames, localConfig, currentAttribute, setLocalConfig, setChosenDirection } = useContext(GroupAndArrangeContext);

  const emptyItemContent = formatMessage({
    id: 'arrange.empty-item',
    defaultMessage: '<Empty>',
  });

  return (
    <Grid.Root gap={4}>
      <GridItem>
        <SelectField
          chosenField={chosenMediaField}
          setChosenField={(value) => {
            setLocalConfig({
              ...localConfig!,
              chosenMediaField: value
            });
          }}
          attributeNames={mediaAttributeNames}
          hintContent={formatMessage({
            id: 'arrange.media-select.hint',
            defaultMessage: 'Option controls what media field will be displayed as items preview in the group. Only affects current user.',
          })}
          labelContent={formatMessage({
            id: 'arrange.media-select.label',
            defaultMessage: 'Media field to display',
          })}
          placeholderContent={formatMessage({
            id: 'arrange.media-select.placeholder',
            defaultMessage: 'Choose media field',
          })}
          emptyItemContent={emptyItemContent}
        />
      </GridItem>
      <GridItem>
        <SelectField
          chosenField={chosenTitleField}
          setChosenField={(value) => {
            setLocalConfig({
              ...localConfig!,
              chosenTitleField: value
            });
          }}
          attributeNames={titleAttributeNames}
          hintContent={formatMessage({
            id: 'arrange.title-select.hint',
            defaultMessage: 'Option controls what text field will be used to display titles. Only affects current user.',
          })}
          labelContent={formatMessage({
            id: 'arrange.title-select.label',
            defaultMessage: 'Title field to display',
          })}
          placeholderContent={formatMessage({
            id: 'arrange.title-select.placeholder',
            defaultMessage: 'Choose title field',
          })}
          emptyItemContent={emptyItemContent}
        />
      </GridItem>
      <GridItem>
        <SelectField
          chosenField={localConfig?.chosenSubtitleField}
          setChosenField={(value) => {
            setLocalConfig({
              ...localConfig!,
              chosenSubtitleField: value
            });
          }}
          attributeNames={titleAttributeNames}
          hintContent={formatMessage({
            id: 'arrange.subtitle-select.hint',
            defaultMessage: 'Option controls what text field will be used to display subtitles. Only affects current user.',
          })}
          labelContent={formatMessage({
            id: 'arrange.subtitle-select.label',
            defaultMessage: 'Subtitle field to display',
          })}
          placeholderContent={formatMessage({
            id: 'arrange.subtitle-select.placeholder',
            defaultMessage: 'Choose subtitle field',
          })}
          emptyItemContent={emptyItemContent}
        />
      </GridItem>
      {currentAttribute?.isOrder2d && 
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
              value={localConfig?.rowHeight || 30}
              onValueChange={(value: number | undefined): void => {
                setLocalConfig({
                  ...localConfig!,
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
      }
      {currentAttribute?.isOrder2d && 
        <GridItem>
          <Field.Root
            hint={formatMessage({
              id: 'arrange.direction.hint',
              defaultMessage: 'Controls the direction of the 2d order. Only affects current session.',
            })}
            width="100%">
            <Field.Label>
              {formatMessage({
                id: 'arrange.direction.label',
                defaultMessage: 'Direction'
              })}
            </Field.Label>
            <SingleSelect
              placeholder={formatMessage({
                id: 'arrange.direction.placeholder',
                defaultMessage: 'Choose direction'
              })}
              value={chosenDirection}
              onChange={x => setChosenDirection((x || null) as GridDirection)}
            >
              <SingleSelectOption
                key='horizontal'
                value='horizontal'>
                {formatMessage({
                  id: 'arrange.direction.horizontal',
                  defaultMessage: 'Horizontal'
                })}
              </SingleSelectOption>
              <SingleSelectOption
                key='vertical'
                value='vertical'>
                {formatMessage({
                  id: 'arrange.direction.vertical',
                  defaultMessage: 'Vertical'
                })}
              </SingleSelectOption>
              <SingleSelectOption
                key=''
                value=''>
                  {formatMessage({
                    id: 'arrange.direction.none',
                    defaultMessage: '<None>'
                  })}
              </SingleSelectOption>
            </SingleSelect>
            <Field.Hint />
          </Field.Root>
        </GridItem>
      }
    </Grid.Root>
  );
};