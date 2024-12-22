import { Flex, Main, StrapiTheme, TypographyComponent } from '@strapi/design-system';
import { Typography } from '@strapi/design-system';
import { FormattedMessage } from 'react-intl';
import { useTranslation } from '../utils/useTranslation';

import styled from 'styled-components';
import { Layouts, Page } from '@strapi/strapi/admin';

import { LeftMenu } from '../components/LeftMenu';
import { GridFour } from '@strapi/icons';


const WelcomePage = () => {
  const { formatMessage } = useTranslation();

  const MainBox = styled.div`
    margin: ${({ theme }) => (theme as StrapiTheme).spaces[4]};
    padding: ${({ theme }) => (theme as StrapiTheme).spaces[6]};
    background-color: ${({ theme }) => (theme as StrapiTheme).colors.neutral0};
  `;
  const WordWrap = styled<TypographyComponent>(Typography)`
    word-break: break-word;
    p, ol {
      margin-bottom: ${({ theme }) => (theme as StrapiTheme).spaces[2]};
    }
    li {
      list-style-type: number;
    }
  `;
  const GridFourCustom = styled(GridFour)`
    margin-right: ${({ theme }) => (theme as StrapiTheme).spaces[2]};
    width: ${({ theme }) => (theme as StrapiTheme).spaces[6]};
    height: ${({ theme }) => (theme as StrapiTheme).spaces[6]};
  `;

  return (
    <Layouts.Root sideNav={<LeftMenu />}>
      <Page.Title>
        {formatMessage({
          id: 'plugin.name',
          defaultMessage: 'Group and Arrange',
        })}
      </Page.Title>
      <Main>
        <MainBox>
          <Flex direction="column" alignItems="flex-start" gap={5}>
            <Typography variant="alpha">
              <GridFourCustom />
              {formatMessage({
                id: 'plugin.name',
                defaultMessage: 'Group and Arrange',
              })}
            </Typography>
            <WordWrap>
              <FormattedMessage
                id="plugin.description"
                defaultMessage="This plugin allows you to group and arrange content types in the Strapi admin panel. Choose collection and group in panel to the left to get started!"
              />
            </WordWrap>
            <WordWrap>
              <FormattedMessage
                id="plugin.instructions"
                defaultMessage="
                <p>To use the Group and Arrange plugin, follow these steps:</p>
                <ol>
                  <li>Navigate to the Strapi admin panel.</li>
                  <li>In the left menu, select the collection type you want to group and arrange.</li>
                  <li>Use the drag-and-drop interface to organize your content types.</li>
                  <li>Click <b>Save</b> to apply your changes.</li>
                </ol>
                <p>For more detailed instructions, refer to the plugin documentation.</p>
                "
                values={{
                  b: (chunks: any) => <strong>{chunks}</strong>,
                  i: (chunks: any) => <em>{chunks}</em>,
                  u: (chunks: any) => <u>{chunks}</u>,
                  p: (chunks: any) => <p>{chunks}</p>,
                  br: () => <br />,
                  ul: (chunks: any) => <ul>{chunks}</ul>,
                  ol: (chunks: any) => <ol>{chunks}</ol>,
                  li: (chunks: any) => <li>{chunks}</li>,
                  code: (chunks: any) => <code>{chunks}</code>,
                  pre: (chunks: any) => <pre>{chunks}</pre>,
                }}
              />
            </WordWrap>
          </Flex>
        </MainBox>
      </Main>
    </Layouts.Root>
  );
};

export { WelcomePage };
