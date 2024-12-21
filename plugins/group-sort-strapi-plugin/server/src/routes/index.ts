export default [
  {
    method: 'GET',
    path: '/itemsAndGroups/:uid',
    handler: `groups.getItemsWithGroups`,
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/groups/:uid',
    handler: 'groups.getGroupsWithItems',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/groups/:uid/:groupname',
    handler: 'groups.getGroup',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/group-names/:uid',
    handler: 'groups.getGroupNames',
    config: {
      policies: [],
    },
  },
];
