// frontend/src/shared/utils/classnames.ts
export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export const cn = classNames;
