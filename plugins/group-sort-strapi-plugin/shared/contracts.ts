export interface GroupResultMeta {
  groupName: string,
  orderField: string,
  order2dDirection: 'horizontal' | 'vertical' | null
}

export interface GroupResult extends GroupResultMeta {
  items: any[]
}

export interface GroupResultItem {
  item: any,
  groups: GroupResultMeta[]
}