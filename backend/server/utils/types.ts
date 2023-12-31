export type StringToArrayOfStrings<T extends object> = {
  [P in keyof T as T[P] extends string | null ? P : P]-?: T[P] extends
    | string
    | null
    ? NonNullable<T[P][]>
    : NonNullable<T[P]>;
};
