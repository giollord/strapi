import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { NavLink, useParams } from 'react-router-dom';
import { parse, stringify } from 'qs';
import { styled } from 'styled-components';
import { Permission, useQueryParams } from '@strapi/admin/strapi-admin';
import {
  useCollator,
  useFilter,
  SubNav,
  SubNavHeader,
  SubNavLink,
  SubNavSection,
  SubNavSections,
  StrapiTheme
} from '@strapi/design-system';
import {useFetchClient} from '@strapi/admin/strapi-admin';
import { Struct } from '@strapi/types';
import { ArrowLeft } from '@strapi/icons';
import { getTranslation } from '../utils/useTranslation';
import { useAsyncMemo } from '../utils/useAsyncMemo';

interface ContentManagerLink {
  permissions: Permission[];
  search: string | null;
  kind: string;
  title: string;
  to: string;
  uid: string;
  name: string;
  isDisplayed: boolean;
}

const SubNavHeaderWrapper = styled.div`
  h2 {
    font-size: ${({ theme }) => (theme as StrapiTheme).fontSizes[3]};
  }
`;

const SubNavLinkCustom = styled(SubNavLink)`
  color: ${({ theme }) => (theme as StrapiTheme).colors.primary600};
`;

interface LeftMenuProps {
  uid: string;
}

const LeftMenu = () => {
  const [search, setSearch] = useState('');
  const [{ query }] = useQueryParams<{ plugins?: object }>();
  const { formatMessage, locale } = useIntl();

  const fetchClient = useFetchClient();
  const allCollectionTypes: Struct.ContentTypeSchema[] = useAsyncMemo(async () => {
    const response = await fetchClient.get('/content-manager/content-types');
    return response.data.data;
  }, []) ?? [];
  const collectionTypes = allCollectionTypes
    .filter((collectionType: any) =>
      collectionType.isDisplayed &&
      collectionType.kind === 'collectionType');
  const collectionTypesDict = collectionTypes.reduce((acc, collectionType) => {
    acc[collectionType.uid] = collectionType;
    return acc;
  }, {} as Record<string, Struct.ContentTypeSchema>);
  
  const {uid} = useParams<{uid: string}>();
  const isCollectionTypeOpen = Boolean(uid);
  const collectionTypesLoaded = collectionTypes.length > 0;

  const tmp = useAsyncMemo(async () => {
    const response = await fetchClient.get(`/group-sort-strapi-plugin/groups/${uid}`);
    console.log(response.data);
    return response.data;
  }, [uid]);

  useEffect(() => {
    const collectionTypeLinks: ContentManagerLink[] = collectionTypes?.map((collectionType) => ({
        permissions: [],
        search: null,
        kind: collectionType.kind,
        title: collectionType.info.displayName,
        to: `/plugins/group-sort-strapi-plugin/${collectionType.uid}`,
        uid: collectionType.uid,
        name: (collectionType.info as any).name,
        isDisplayed: (collectionType.info as any).isDisplayed,
    })) ?? [];
    setCollectionTypeLinks(collectionTypeLinks);
  }, [collectionTypes]);
  const [collectionTypeLinks, setCollectionTypeLinks] = useState<ContentManagerLink[]>();
  

  const { startsWith } = useFilter(locale, {
    sensitivity: 'base',
  });

  const formatter = useCollator(locale, {
    sensitivity: 'base',
  });

  const menu = useMemo(
    () =>
      [
        {
          id: 'collectionTypes',
          title: formatMessage({
            id: getTranslation('components.LeftMenu.collection-types'),
            defaultMessage: 'Collection Types',
          }),
          searchable: true,
          links: collectionTypeLinks,
        },
      ].map((section) => ({
        ...section,
        links: section.links
          /**
           * Filter by the search value
           */
          ?.filter((link) => startsWith(link.title, search))
          /**
           * Sort correctly using the language
           */
          .sort((a, b) => formatter.compare(a.title, b.title))
          /**
           * Apply the formated strings to the links from react-intl
           */
          .map((link) => {
            return {
              ...link,
              title: formatMessage({ id: link.title, defaultMessage: link.title }),
            };
          }),
      })),
    [collectionTypeLinks, search, startsWith, formatMessage, formatter]
  );

  const handleClear = () => {
    setSearch('');
  };

  const handleChangeSearch = ({ target: { value } }: { target: { value: string } }) => {
    setSearch(value);
  };

  const label = formatMessage({
    id: getTranslation('header.name'),
    defaultMessage: 'Sorting',
  });

  const getPluginsParamsForLink = (link: ContentManagerLink) => {
    const schema = collectionTypes?.find((schema: any) => schema.uid === link.uid);
    const isI18nEnabled = Boolean((schema?.pluginOptions?.i18n as any)?.localized);

    // The search params have the i18n plugin
    if (query.plugins && 'i18n' in query.plugins) {
      // Prepare removal of i18n from the plugins search params
      const { i18n, ...restPlugins } = query.plugins;

      // i18n is not enabled, remove it from the plugins search params
      if (!isI18nEnabled) {
        return restPlugins;
      }

      // i18n is enabled, put the plugins search params back together
      return { i18n, ...restPlugins };
    }

    return query.plugins;
  };

  return (
    <SubNav aria-label={label}>
      <SubNavHeader
        label={label}
        searchable
        value={search}
        onChange={handleChangeSearch}
        onClear={handleClear}
        searchLabel={formatMessage({
          id: getTranslation('left-menu.search.label'),
          defaultMessage: 'Search for a content type',
        })}
      />
      {isCollectionTypeOpen && collectionTypesLoaded && <>
      <SubNavLinkCustom
        href="/admin/plugins/group-sort-strapi-plugin"
        icon={<ArrowLeft />}>
        {formatMessage({
          id: getTranslation('left-menu.back.label'),
          defaultMessage: 'Back',
        })}
      </SubNavLinkCustom>
      <SubNavHeaderWrapper>
        <SubNavHeader label={collectionTypesDict[uid!].info.displayName} />
      </SubNavHeaderWrapper>
      <SubNavSections>
        {menu.map((section) => {
          return (
            <SubNavSection
              key={section.id}
              label={section.title}
              badgeLabel={section.links?.length.toString()}
            >
              {section.links?.map((link) => {
                return (
                  <SubNavLink
                    tag={NavLink}
                    key={link.uid}
                    to={{
                      pathname: link.to,
                      search: stringify({
                        ...parse(link.search ?? ''),
                        plugins: getPluginsParamsForLink(link),
                      }),
                    }}
                    width="100%"
                  >
                    {link.title}
                  </SubNavLink>
                );
              })}
            </SubNavSection>
          );
        })}
      </SubNavSections>
      </>}
      {!isCollectionTypeOpen && collectionTypesLoaded && <>
      <SubNavSections>
        {menu.map((section) => {
          return (
            <SubNavSection
              key={section.id}
              label={section.title}
              badgeLabel={section.links?.length.toString()}
            >
              {section.links?.map((link) => {
                return (
                  <SubNavLink
                    tag={NavLink}
                    key={link.uid}
                    to={{
                      pathname: link.to,
                      search: stringify({
                        ...parse(link.search ?? ''),
                        plugins: getPluginsParamsForLink(link),
                      }),
                    }}
                    width="100%"
                  >
                    {link.title}
                  </SubNavLink>
                );
              })}
            </SubNavSection>
          );
        })}
      </SubNavSections>
      </>}
    </SubNav>
  );
};

export { LeftMenu };
