import { useCallback, useState } from 'react';
import { useMutation } from 'react-query';

import {
  Page,
  useNotification,
  Layouts,
  useFetchClient,
} from '@strapi/admin/strapi-admin';
import { Box, Button, EmptyStateLayout, Field, Flex, Grid, Modal, NumberInput, Toggle } from '@strapi/design-system';

import { useTranslation } from '../hooks/useTranslation';
import { Settings } from '..//./../../shared/settings';
import { Check } from '@strapi/icons';
import { PLUGIN_ID } from '../../../shared/constants';
import { useIntl } from 'react-intl';
import useSettings from '../hooks/useSettings';
import { isEqual } from 'lodash';

// TODO: unused at the moment
export const SettingsPage = () => {
  const { formatMessage } = useTranslation();
  const { formatMessage: formatMessageIntl } = useIntl();
  const { toggleNotification } = useNotification();
  const { put } = useFetchClient();
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);
  const { settings, isLoading: isFetching, refetch } = useSettings();
  const [modifiedData, setModifiedData] = useState<Settings | null>(settings || null);

  const updateValues = useCallback((updateValue: (settings: Settings) => Settings | null) => {
    const value = updateValue(modifiedData || settings!) || modifiedData;
    const dataWasModified = !isEqual(modifiedData, value);
    setIsSaveButtonDisabled(!dataWasModified);
    setModifiedData(value || null);
  }, []);

  const { mutateAsync, isLoading: isSubmitting } = useMutation<Settings, any, Settings>(
    async (body) => {
      const { data } = await put(`/${PLUGIN_ID}/settings`, body);

      return data;
    },
    {
      onSuccess() {
        refetch();

        toggleNotification({
          type: 'success',
          message: formatMessage({ id: 'settings.save.success' }),
        });
      },
      onError(err) {
        console.error(err);
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSaveButtonDisabled) {
      return;
    }

    await mutateAsync(modifiedData!);
  };

  const isLoading = isFetching || isSubmitting;

  if (isLoading) {
    return <Page.Loading />;
  }

  return (
    <Page.Main tabIndex={-1}>
      <Page.Title>
        {formatMessage({
          id: 'settings.page.title',
          defaultMessage: 'Settings - Group and Arrange',
        })}
      </Page.Title>
      <form onSubmit={handleSubmit}>
        <Layouts.Header
          primaryAction={<>
            <Button
              disabled={isSaveButtonDisabled}
              loading={isLoading}
              type="submit"
              startIcon={<Check />}
              size="S"
            >
              {formatMessageIntl({
                id: 'global.save',
                defaultMessage: 'Save',
              })}
            </Button>
          </>}
          title={formatMessage({
            id: 'settings.name',
            defaultMessage: 'Group and Arrange',
          })}
          subtitle={formatMessage({
            id: 'settings.description',
            defaultMessage: 'Configure the settings',
          })}
        />
        <Layouts.Content>
          <Layouts.Root>
            <Flex direction="column" alignItems="stretch" gap={12}>
              <Box background="neutral0" padding={6} shadow="filterShadow" hasRadius>
                <Flex direction="column" alignItems="stretch" gap={4}>
                  <Grid.Root gap={6}>
                    <Grid.Item col={6} s={12} direction="column" alignItems="stretch">
                      <Field.Root
                        hint={formatMessage({
                          id: 'settings.always-show-field-type.description',
                          defaultMessage:
                            'When enabled, the field type will always be shown in the list of fields to the left.',
                        })}
                        name="alwaysShowFieldTypeInList"
                      >
                        <Field.Label>{formatMessage({
                          id: 'settings.always-show-field-type.label',
                          defaultMessage: 'Always show field type in list',
                        })}</Field.Label>
                        <Toggle
                          offLabel={formatMessageIntl({
                            id: 'app.components.ToggleCheckbox.off-label',
                            defaultMessage: 'Off',
                          })}
                          onLabel={formatMessageIntl({
                            id: 'app.components.ToggleCheckbox.on-label',
                            defaultMessage: 'On',
                          })}
                          checked={modifiedData?.alwaysShowFieldTypeInList}
                          onChange={e => {
                            updateValues(d => d ? { ...d, alwaysShowFieldTypeInList: e.target.checked } : null);
                          }} />
                      </Field.Root>
                    </Grid.Item>
                  </Grid.Root>
                </Flex>
              </Box>
            </Flex>
          </Layouts.Root>
        </Layouts.Content>
      </form>
    </Page.Main>
  );
};

