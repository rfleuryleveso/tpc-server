export type ServiceMethod<R, T> = (data: R) => Promise<T>;
