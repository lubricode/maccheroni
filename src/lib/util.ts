import { Observable, Subject } from "rxjs";

export interface AsyncFunction<X, Y> {
  (x: X): Promise<Y>;
}

export class Observer<T> extends Subject<T> {
  next(value: T): this {
    return super.next(value), this;
  }

  get value$(): Observable<T> {
    return this.asObservable();
  }
}
