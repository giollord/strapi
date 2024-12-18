import { DesignSystemProvider, Main, TypographyComponent } from '@strapi/design-system';
import { Typography } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import useTranslation from '../utils/useTranslation';

import styled from 'styled-components';

const HomePage = () => {
  const { formatMessage } = useTranslation();
  
  return (
    <MainHeader tag='h1' variant='alpha'>
      Welcome to {formatMessage({ id: 'plugin.name' })}
    </MainHeader>
  );
};

const MainHeader = styled<TypographyComponent>(Typography)`

`;

export { HomePage };
