import { useFetchClient } from '@strapi/strapi/admin';
import { UseQueryResult, useQuery } from 'react-query';
import { PLUGIN_ID } from '../../../shared/constants';
import { GroupResult } from '../../../shared/contracts';

export interface UseGroupDataParams {
  contentTypeUid: string | undefined;
  groupField: string | undefined;
  groupName: string | undefined;
}

const useGroupData = (props: UseGroupDataParams) => {
  const { contentTypeUid, groupField, groupName } = props;

  const fetchClient = useFetchClient();

  const result = useQuery({
    queryKey: [PLUGIN_ID, 'groups', contentTypeUid, groupField, groupName],
    async queryFn() {
      const result = await fetchClient.get(
        `/${PLUGIN_ID}/groups/${contentTypeUid}/${groupField}/${groupName}`
      );
      return result.data as GroupResult;
    },
    enabled: !!contentTypeUid && !!groupField && !!groupName,
  }) as UseQueryResult<GroupResult, unknown> & { groupData: GroupResult | undefined };

  result.groupData = result.data;
    
  return result;
};

export default useGroupData;
