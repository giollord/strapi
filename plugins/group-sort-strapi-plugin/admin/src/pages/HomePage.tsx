import { DesignSystemProvider, Main, TypographyComponent } from '@strapi/design-system';
import { Typography } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { useTranslation } from '../utils/useTranslation';

import styled from 'styled-components';
import { Layouts, Page, useFetchClient } from '@strapi/strapi/admin';
import { useEffect, useMemo } from 'react';
import { useAsyncMemo } from '../utils/useAsyncMemo';

import { Struct } from '@strapi/types';
import { LeftMenu } from '../components/LeftMenu';


const HomePage = () => {
  const { formatMessage } = useTranslation();
  
  const fetchClient = useFetchClient();
  const collectionTypes: any = useAsyncMemo(async () => {
    const response = await fetchClient.get('/content-manager/content-types');
    const allCollectionTypes = response.data.data as Struct.ContentTypeSchema[];
    
    const filteredCollectionTypes = allCollectionTypes
    .filter((collectionType: any) =>
      collectionType.isDisplayed &&
      collectionType.kind === 'collectionType');
    return filteredCollectionTypes;
  }, []);
  
  useEffect(() => {
    console.log(collectionTypes);
  }, [collectionTypes]);

  return (
    <Layouts.Root sideNav={<LeftMenu />}>
      <Page.Title>
        {formatMessage({
          id: 'plugin.name',
          defaultMessage: 'Group Sort',
        })?.toString() || ''}
      </Page.Title>
      <Page.Main>
        hello
      </Page.Main>
    </Layouts.Root>
  );
};

const MainHeader = styled<TypographyComponent>(Typography)`

`;

export { HomePage };
