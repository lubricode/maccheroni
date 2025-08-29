import { AccessorActionInterceptor } from "../action/interceptors/accessor";
import { BaseStoreProps, StoreOperators, StoreProps } from "./types";

export class Store<
  T,
  U,
  Queries extends string = string,
  Mutations extends string = string,
  Operators extends StoreOperators<U, Queries, Mutations> = StoreOperators<
    U,
    Queries,
    Mutations
  >
> {
  constructor(
    public readonly props: StoreProps<T, U, Queries, Mutations, Operators>
  ) {}
}

export class CommonStore<
  T,
  Queries extends string,
  Mutations extends string,
  Operators extends StoreOperators<T, Queries, Mutations>
> extends Store<T, T, Queries, Mutations, Operators> {
  constructor(props: BaseStoreProps<T, T, Queries, Mutations, Operators>) {
    super({ ...props, interceptor: new AccessorActionInterceptor() });
  }
}
