import { UseQueryResult, useQuery } from 'react-query';
import { PLUGIN_ID } from '../../../shared/constants';
import {  GroupResultMeta } from '../../../shared/contracts';
import { useFetchClient } from '@strapi/strapi/admin';

export interface UseGroupNamesParams {
    contentTypeUid: string | undefined;
}

/**
 * Fetches group names from the Strapi API
 * @param props - The parameters to fetch the group names, including the content type UID
 * @returns The group names
 */
const useGroupNames = (props: UseGroupNamesParams) => {
  const { contentTypeUid } = props;
  
  const fetchClient = useFetchClient();
  
  const result =  useQuery({
    queryKey: [PLUGIN_ID, 'groups', contentTypeUid],
    async queryFn() {
      const result = await fetchClient.get(`/${PLUGIN_ID}/group-names/${contentTypeUid}`);
      return result.data as GroupResultMeta[];
    },
    enabled: Boolean(contentTypeUid),
  })as UseQueryResult<GroupResultMeta[], unknown> & { groupNames: GroupResultMeta[] | undefined };

  result.groupNames = result.data;
    
  return result;
};

function substituteQuery<T>(value: T): { data: T; isLoading: boolean } | null {
  if (value === undefined || value === null) {
    return null;
  }
  return {
    data: value,
    isLoading: false
  }
}

export default useGroupNames;
