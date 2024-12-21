export interface GroupResultName {
  groupName: string,
  orderField: string
}

export interface GroupResult extends GroupResultName {
  items: any[],
}

export interface GroupResultItem {
  item: any,
  groups: GroupResultName[]
}