export default [
  {
    method: 'GET',
    path: '/settings',
    handler: `groups.getItemsWithGroups`,
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/settings',
    handler: 'groups.getGroupsWithItems',
    config: {
      policies: [],
    },
  },
];
  