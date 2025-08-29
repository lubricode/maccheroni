import { uniq } from "lodash";

export type MaybeArray<T> = T | T[];

export const unique = <T>(
  items: NonNullable<T>[]
): NonNullable<T> | undefined => {
  const [item, ...{ length }] = uniq(items);

  if (item != null && length === 0) {
    return item;
  }
};
