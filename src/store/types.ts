import { Action, ActionInterceptor } from "../action";
import { AsyncFunction } from "../lib/util";

export interface StoreOperators<T, Q extends string, M extends string> {
  query: Record<Q, (payload: any) => Action<"query", T, any>>;
  mutation: Record<M, (payload: any) => Action<"mutation", T, any>>;
}

export interface BaseStoreProps<
  T,
  U,
  Queries extends string,
  Mutations extends string,
  Operators extends StoreOperators<U, Queries, Mutations>
> {
  target: T;
  operators: (builder: {
    query: <P, R>(
      queryFactory: (payload: P) => AsyncFunction<U, R>
    ) => (payload: P) => Action<"query", U, R>;
    mutation: <P, R = void>(
      mutationFactory: (payload: P) => AsyncFunction<U, R>
    ) => (payload: P) => Action<"mutation", U, R>;
  }) => Operators;
}

export interface StoreProps<
  T,
  U,
  Queries extends string,
  Mutations extends string,
  Operators extends StoreOperators<U, Queries, Mutations>
> extends BaseStoreProps<T, U, Queries, Mutations, Operators> {
  interceptor: ActionInterceptor<T, U>;
}
