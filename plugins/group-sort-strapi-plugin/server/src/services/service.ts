import type { Core } from '@strapi/strapi';
import { get } from 'lodash';
import { GroupResult, GroupResultNames } from '../../../shared/contracts';
import { ContentTypeNotFoundError, GroupNameFieldNotFound } from '../../../shared/errors';

const THROW_IF_GROUP_NAME_FIELD_NOT_FOUND = false;

const getGroupConfigs = (strapi, uid) => {
  const contentType = strapi.contentTypes[uid];
  if(!contentType) {
    throw new ContentTypeNotFoundError(uid);
  }

  const groupConfigs: { orderField: string, groupNameField: string }[] = [];

  for(const key in contentType.attributes) {
    const attr = contentType.attributes[key];
    const groupNameField = get(attr, ['group-sort-strapi-plugin', 'pluginOptions', 'group', 'groupNameField']) as string;

    if(!groupNameField) continue;
    if(!contentType.attributes[groupNameField]) {
      if(THROW_IF_GROUP_NAME_FIELD_NOT_FOUND)
        throw new GroupNameFieldNotFound(groupNameField);
      continue;
    }

    groupConfigs.push({
      orderField: key,
      groupNameField,
    });
  }

  return groupConfigs;
}

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  getWelcomeMessage(ctx) {
    return { hello: 'Welcome to Strapi 🚀' };
  },

  async getGroup(ctx): Promise<GroupResult> {
    const { uid, groupname } = ctx.params;

    const groupConfigs = getGroupConfigs(strapi, uid);
    const groupConfig = groupConfigs.find((groupConfig) => groupConfig.groupNameField === groupname);
    if(!groupConfig) {
      return null;
    }

    const entities = await strapi.db.query(uid).findMany({});
    const group = {
      name: groupConfig.groupNameField,
      orderField: groupConfig.orderField,
      items: [],
    };

    for(const entity of entities) {
      const groupName = get(entity, groupConfig.groupNameField) as string;
      if(groupName !== groupname) continue;

      group.items.push(entity);
    }

    return group;
  },

  async getAllGroups(ctx): Promise<GroupResult[]> {
    const { uid } = ctx.params;
    
    const groupConfigs = getGroupConfigs(strapi, uid);
    const entities = await strapi.db.query(uid).findMany({});
    const groupsDict: Record<string, {orderField: any, items: any[]}> = {};

    for(const groupConfig of groupConfigs) {
      const { orderField, groupNameField } = groupConfig;

      for(const entity of entities) {
        const groupName = get(entity, groupNameField) as string;
        if(!groupName) continue;

        if(!groupsDict[groupName]) {
          groupsDict[groupName] = {
            orderField,
            items: [],
          };
        }

        groupsDict[groupName].items.push(entity);
      }
    }

    const groups: GroupResult[] = [];
    for(const groupName in groupsDict) {
      groups.push({
        name: groupName,
        orderField: groupsDict[groupName].orderField,
        items: groupsDict[groupName].items,
      });
    }

    return groups;
  },

  async getGroupNames(ctx): Promise<GroupResultNames[]> {
    const groups = await this.getAllGroups(ctx);
    const groupNames = groups.map((group: GroupResult) => ({
      name: group.name,
      orderField: group.orderField
    }));
    return groupNames;
  }
});

export default service;
