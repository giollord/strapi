import { useContext, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { NavLink, useParams } from 'react-router-dom';
import { parse, stringify } from 'qs';
import { styled } from 'styled-components';
import { Page, Permission, useQueryParams } from '@strapi/admin/strapi-admin';
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
import { getTranslation, useTranslation } from '../hooks/useTranslation';
import { GroupResult, GroupResultMeta } from '../../../shared/contracts';
import { PLUGIN_ID, UNDEFINED_GROUP_NAME } from '../../../shared/constants';
import { useQuery } from 'react-query';
import { Rec } from '@strapi/database/dist/query/helpers';
import { GroupAndArrangeContext } from './GroupAndArrangeContextProvider';

interface ContentManagerLink {
  permissions: Permission[];
  search: string | null;
  kind: string | null;
  title: string;
  to: string;
  uid: string;
  name: string;
  isDisplayed: boolean;
  placeOnTop?: boolean;
}

const SubNavHeaderWrapper = styled.div`
  h2 {
    font-size: ${({ theme }) => (theme as StrapiTheme).fontSizes[3]};
  }
`;

const SubNavLinkCustom = styled(SubNavLink)`
  color: ${({ theme }) => (theme as StrapiTheme).colors.primary600};
`;

function substituteQuery<T>(value: T): { data: T; isLoading: boolean } | null {
  if (value === undefined || value === null) {
    return null;
  }
  return {
    data: value,
    isLoading: false
  }
}

const LeftMenu = () => {
  const [search, setSearch] = useState('');
  const [{ query }] = useQueryParams<{ plugins?: object }>();
  const { formatMessage, locale } = useTranslation();
  const { formatMessage: formatMessageIntl } = useIntl();

  const {
    collectionTypes,
    groupNames,
    contentTypeUid,
    groupName,
    groupData,
    isLoading} = useContext(GroupAndArrangeContext);

  
  const isCollectionTypeOpen = Boolean(contentTypeUid);
  const isGroupOpen = Boolean(groupName) || groupName === '';

  const collectionTypesDict = (collectionTypes || []).reduce((acc, collectionType) => {
    acc[collectionType.uid] = collectionType;
    return acc;
  }, {} as Record<string, Struct.ContentTypeSchema>);

  const collectionTypeLinks: ContentManagerLink[] = collectionTypes?.map((collectionType) => ({
      permissions: [],
      search: null,
      kind: collectionType.kind,
      title: collectionType.info.displayName,
      to: `/plugins/${PLUGIN_ID}/${collectionType.uid}`,
      uid: collectionType.uid,
      name: (collectionType.info as any).name,
      isDisplayed: (collectionType.info as any).isDisplayed,
  })) || [];
  
  const nameOccurencesCount = groupNames?.reduce((acc, group) => {
    acc[group.groupName] = (acc[group.groupName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  const groupLinks: ContentManagerLink[] = groupNames?.map((group) => {
    const isUndefined = group.groupName === UNDEFINED_GROUP_NAME;
    const name = isUndefined ? formatMessage({
        id: 'left-menu.no-group.label',
        defaultMessage: 'Group and Arrange',
      }) : group.groupName;
    return {
      permissions: [],
      search: null,
      kind: null,
      placeOnTop: isUndefined,
      title: nameOccurencesCount[group.groupName] > 1
        ? `${name} (${group.orderField})`
        : name,
      to: `/plugins/${PLUGIN_ID}/${contentTypeUid}/${group.orderField}/${group.groupName}`,
      uid: contentTypeUid!,
      name: encodeURIComponent(group.groupName),
      isDisplayed: true,
    };
  }) || [];
  

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
            id: 'left-menu.list.collection-types',
            defaultMessage: 'Collection Types',
          }),
          searchable: true,
          formattable: true,
          links: collectionTypeLinks,
          enabled: !isCollectionTypeOpen && !isGroupOpen
        },
        {
          id: 'groups',
          title: formatMessage({
            id: 'left-menu.list.groups',
            defaultMessage: 'Groups',
          }),
          searchable: true,
          formattable: false,
          links: groupLinks,
          enabled: isCollectionTypeOpen
        },
      ].filter((section) => section.enabled)
      .map((section) => ({
        ...section,
        links: section.links
          ?.filter((link) => startsWith(link.title, search))
          .sort((a, b) => a.placeOnTop ? -1 : formatter.compare(a.title, b.title))
          .map((link) => {
            return {
              ...link,
              title: section.formattable
                ? formatMessageIntl({ id: link.title, defaultMessage: link.title })
                : link.title,
            };
          }),
      })),
    [collectionTypes, groupData, search, formatMessage, startsWith, formatMessageIntl, formatter]
  );

  const handleClear = () => {
    setSearch('');
  };

  const handleChangeSearch = ({ target: { value } }: { target: { value: string } }) => {
    setSearch(value);
  };

  const label = formatMessage({
    id: 'left-menu.header.name',
    defaultMessage: 'Group and Arrange',
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

  if(isLoading) {
    return <Page.Loading />;
  }

  return (
    <SubNav aria-label={label}>
      <SubNavHeader
        label={label}
        searchable
        value={search}
        onChange={handleChangeSearch}
        onClear={handleClear}
        searchLabel={formatMessage({
          id: 'left-menu.search.label',
          defaultMessage: 'Search for a content type',
        })}
      />
      {isCollectionTypeOpen && collectionTypes?.length && <>
      <SubNavLinkCustom
        href={`/admin/plugins/${PLUGIN_ID}`}
        icon={<ArrowLeft />}>
        {formatMessage({
          id: 'left-menu.back-to-collecction-types.label',
          defaultMessage: 'Back to collection types',
        })}
      </SubNavLinkCustom>
      <SubNavHeaderWrapper>
        <SubNavHeader label={collectionTypesDict[contentTypeUid!].info.displayName} />
      </SubNavHeaderWrapper>
      </>}
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
                    isSubSectionChild={false}
                  >

                    {link.title}
                  </SubNavLink>
                );
              })}
            </SubNavSection>
          );
        })}
      </SubNavSections>
    </SubNav>
  );
};

export { LeftMenu };
