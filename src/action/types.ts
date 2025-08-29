import { Action, ActionInterceptor } from ".";
import { CaptureStackTrace } from "../lib/stack";
import { Observer } from "../lib/util";

export type ActionType = "query" | "mutation";

export interface ActionEvent<A extends ActionType, U, R> {
  type: A;
  source: Action<A, U, R>;
  target: CaptureStackTrace<PropertyKey>[];
  observer: Observer<R>;
  result: R;
}

export interface ActionAssemblerProps<A extends ActionType, T, U> {
  type: A;
  target: T;
  interceptor: ActionInterceptor<T, U>;
}

export interface ActionProcessorProps<A extends ActionType, T, U> {
  type: A;
  target: T;
  interceptor: ActionInterceptor<T, U>;
}
