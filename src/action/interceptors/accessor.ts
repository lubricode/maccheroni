import { isObject } from "lodash";
import { ActionInterceptor } from "..";
import { StackFrame, StackTrace, StackTraceRecorder } from "../../lib/stack";
import { ActionType } from "../types";

export interface AccessorActionInterceptorHandler<T, U> {
  get: (
    this: AccessorActionInterceptor<T>,
    props: {
      target: U;
      property: Exclude<PropertyKey, number>;
      receiver: any;
      trace: StackTrace<PropertyKey>;
      proxy: <V>(target: V) => V;
    }
  ) => any;
  set: (
    this: AccessorActionInterceptor<T>,
    props: {
      target: U;
      property: Exclude<PropertyKey, number>;
      newValue: any;
      receiver: any;
      trace: StackTrace<PropertyKey>;
      proxy: <V>(target: V) => V;
    }
  ) => boolean;
}

export class AccessorActionInterceptor<T> extends ActionInterceptor<T, T> {
  static readonly PROXY_TARGET = Symbol();

  static unproxy<T extends { [AccessorActionInterceptor.PROXY_TARGET]?: T }>(
    target: T
  ): T {
    return target[AccessorActionInterceptor.PROXY_TARGET] ?? target;
  }

  proxy<A extends ActionType, U>({
    type,
    target,
    trace,
  }: {
    type: A;
    target: U;
    trace: StackTrace<PropertyKey>;
  }): U {
    if (!isObject(target)) {
      return target;
    }

    return new Proxy(
      AccessorActionInterceptor.unproxy(target),
      (<U extends object>(
        handler: AccessorActionInterceptorHandler<T, U>
      ): ProxyHandler<U> => ({
        get: (target, property, receiver) => {
          const currentTrace = trace.concat(new StackFrame(property));

          return handler.get.call(this, {
            target,
            property,
            receiver,
            trace: currentTrace,
            proxy: (target) =>
              this.proxy({ type, target, trace: currentTrace }),
          });
        },
        set: (target, property, newValue, receiver) => {
          const currentTrace = trace.concat(new StackFrame(property));

          return handler.set.call(this, {
            target,
            property,
            newValue,
            receiver,
            trace: currentTrace,
            proxy: (target) =>
              this.proxy({ type, target, trace: currentTrace }),
          });
        },
      }))({
        get: function ({ target, property, receiver, trace, proxy }) {
          if (property === AccessorActionInterceptor.PROXY_TARGET) {
            return target;
          }

          if (type === "query") {
            trace.capture();
          }

          return proxy(Reflect.get(target, property, receiver));
        },
        set: function ({ target, property, newValue, receiver, trace, proxy }) {
          if (type !== "mutation") {
            return false;
          }

          trace.capture();

          return Reflect.set(target, property, proxy(newValue), receiver);
        },
      })
    );
  }

  receiver?: T;

  intercept<A extends ActionType>({
    type,
    target,
    recorder,
  }: {
    type: A;
    target: T;
    recorder: StackTraceRecorder<PropertyKey>;
  }): T {
    return (this.receiver = this.proxy({
      type,
      target: { target },
      trace: recorder.trace(new StackFrame(this.id)),
    }).target);
  }
}
