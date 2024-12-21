export default [
  {
    method: 'GET',
    path: '/',
    // name of the controller file & the method.
    handler: 'controller.index',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/groups/:uid',
    handler: 'controller.getAllGroups',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/groups/:uid/:groupname',
    handler: 'controller.getGroup',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/group-names/:uid',
    handler: 'controller.getGroupNames',
    config: {
      policies: [],
    },
  },
];
