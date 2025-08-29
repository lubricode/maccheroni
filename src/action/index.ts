import { uniqueId } from "lodash";
import { defer, map, Observable, Subject } from "rxjs";
import { StackTraceRecorder } from "../lib/stack";
import { AsyncFunction, Observer } from "../lib/util";
import {
  ActionAssemblerProps,
  ActionEvent,
  ActionProcessorProps,
  ActionType,
} from "./types";

export class Action<A extends ActionType, U, R> {
  recorder = new StackTraceRecorder<PropertyKey>();
  observer = new Observer<R>();

  constructor(
    public readonly type: A,
    public readonly operator: AsyncFunction<U, R>
  ) {}
}

export class ActionAssembler<A extends ActionType, T, U> {
  constructor(private readonly props: ActionAssemblerProps<A, T, U>) {}

  assemble<R>(action: Action<A, U, R>): Observable<ActionEvent<A, U, R>> {
    return defer(() =>
      action.operator(
        this.props.interceptor.intercept({
          type: action.type,
          target: this.props.target,
          recorder: action.recorder,
        })
      )
    ).pipe(
      map((result) => ({
        type: action.type,
        source: action,
        target: action.recorder.records.map((record) => record.trace),
        observer: action.observer?.next(result),
        result,
      }))
    );
  }
}

export abstract class ActionInterceptor<T, U> {
  protected readonly id = uniqueId();

  constructor() {}

  abstract intercept<A extends ActionType>(props: {
    type: A;
    target: T;
    recorder: StackTraceRecorder<PropertyKey>;
  }): U;
}

export class ActionProcessor<A extends ActionType, T, U> {
  private readonly actions: Subject<Observable<ActionEvent<A, U, any>>>;
  private readonly assembler: ActionAssembler<A, T, U>;

  constructor(private readonly props: ActionProcessorProps<A, T, U>) {
    this.actions = new Subject();
    this.assembler = new ActionAssembler(this.props);
  }

  process<R>(action: Action<A, U, R>) {
    this.actions.next(this.assembler.assemble(action));
  }
}
