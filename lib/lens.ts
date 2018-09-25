export interface PropertyLens<T> {
  get(): T;
  set(newValue: T): void;
}

export type ObjectLens<T> = {
  [k in keyof T]-?: Extract<T[k], object> extends never
    ? PropertyLens<T[k]>
    : Lens<Extract<T[k], object>> & PropertyLens<T[k]>
};

export interface ArrayLens<T> {
  push(newItem: T): void;
  [index: number]: T;
}

export type Lens<T> = T extends any[]
  ? ArrayLens<T[number]>
  : T extends object ? ObjectLens<T> : T;

export type LensCallback<T, R> = (_: Lens<T>) => R;
export type LensReturnType<T, R> = R extends void
  ? T
  : R extends PropertyLens<infer RR> ? RR : R;

export function lens<T extends object, R>(
  callback: LensCallback<T, R>
): LensReturnType<T, R> {
  throw new Error("Not implemented yet");
}
