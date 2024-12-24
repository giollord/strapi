import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';

import {
  Page,
  useNotification,
  Layouts,
  useFetchClient,
} from '@strapi/admin/strapi-admin';
import { Box, Button, EmptyStateLayout, Field, Flex, Grid, Modal, NumberInput } from '@strapi/design-system';

import { useTranslation } from '../hooks/useTranslation';
import { Settings } from '..//./../../shared/settings';
import { Check } from '@strapi/icons';
import { PLUGIN_ID } from '../../../shared/constants';
import { useIntl } from 'react-intl';

export const SettingsPage = () => {
  const { formatMessage } = useTranslation();
  const { formatMessage: formatMessageIntl } = useIntl();
  const { toggleNotification } = useNotification();
  const { get, put } = useFetchClient();
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);
  
  const { data, isLoading: isFetching, refetch } = useQuery({
    queryKey: [PLUGIN_ID, 'settings'],
    async queryFn() {
      const {
        data: { data },
      } = await get(`/${PLUGIN_ID}/settings`);

      setModifiedData(data);
      return data;
    },
  });

  const [modifiedData, setModifiedData] = useState<Settings | null>(data);
  useEffect(() => {
    const dataWasModified = JSON.stringify(data) !== JSON.stringify(modifiedData);
    setIsSaveButtonDisabled(!dataWasModified);
    setModifiedData(data);
  }, [modifiedData]);

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
                          id: 'settings.form.responsiveDimensions.description',
                          defaultMessage:
                            'Enabling this option will generate multiple formats (small, medium and large) of the uploaded asset.',
                        })}
                        title={formatMessage({
                          id: 'settings.form.responsiveDimensions.label',
                          defaultMessage: 'Responsive friendly upload',
                        })?.toString()}
                        name="responsiveDimensions"
                      >
                        <NumberInput
                          value={modifiedData?.horisontalDivisions}
                          onValueChange={value => {
                            setModifiedData(d => d ? { ...d, horisontalDivisions: value || 0 } : null);
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

