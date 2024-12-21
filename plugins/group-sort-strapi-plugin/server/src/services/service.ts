import type { Core } from '@strapi/strapi';
import { get } from 'lodash';
import { GroupResult, GroupResultItem, GroupResultName } from '../../../shared/contracts';
import { ContentTypeNotFoundError, GroupNameFieldNotFound } from '../../../shared/errors';
import { PLUGIN_ID } from '../../../shared/pluginId';

const THROW_IF_GROUP_NAME_FIELD_NOT_FOUND = false;

const getGroupConfigs = (strapi, uid) => {
  const contentType = strapi.contentTypes[uid];
  if(!contentType) {
    throw new ContentTypeNotFoundError(uid);
  }

  const groupConfigs: { orderField: string, groupNameField: string }[] = [];

  for(const key in contentType.attributes) {
    const attr = contentType.attributes[key];
    const groupNameField = get(attr, [PLUGIN_ID, 'pluginOptions', 'group', 'groupNameField']) as string;

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
  async getGroup(ctx): Promise<GroupResult> {
    const { uid, groupname } = ctx.params;

    const groupConfigs = getGroupConfigs(strapi, uid);
    const groupConfig = groupConfigs.find((groupConfig) => groupConfig.groupNameField === groupname);
    if(!groupConfig) {
      return null;
    }

    const entities = await strapi.db.query(uid).findMany({});
    const group: GroupResult = {
      groupName: groupConfig.groupNameField,
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

  async getItemsWithGroups(ctx): Promise<GroupResultItem[]> {
    const { uid } = ctx.params;
    
    const groupConfigs = getGroupConfigs(strapi, uid);
    const entities = await strapi.db.query(uid).findMany({});
    const result: GroupResultItem[] = [];

    for(const entity of entities) {
      result.push({
        item: entity,
        groups: groupConfigs.map((groupConfig) => ({
          groupName: get(entity, groupConfig.groupNameField) as string,
          orderField: groupConfig.orderField,
        })),
      });
    }
    
    return result;
  },

  async getGroupsWithItems(ctx): Promise<GroupResult[]> {
    const itemsWithGroups = await this.getItemsWithGroups(ctx);
    const groupsDict: Record<string, GroupResult> = {};

    for(const item of itemsWithGroups) {
      for(const group of item.groups) {
        const key = JSON.stringify(group);
        if(!groupsDict[key]) {
          groupsDict[key] = {
            groupName: group.groupName,
            orderField: group.orderField,
            items: [],
          };
        }

        groupsDict[key].items.push(item.item);
      }
    }

    return Object.values(groupsDict);
  },

  async getGroupNames(ctx): Promise<GroupResultName[]> {
    const itemsWithGroups = await this.getItemsWithGroups(ctx);
    const groupsDict: Record<string, GroupResultName> = {};

    for(const item of itemsWithGroups) {
      for(const group of item.groups) {
        const key = JSON.stringify(group);
        groupsDict[key] = group;
      }
    }

    return Object.values(groupsDict);
  }
});

export default service;
