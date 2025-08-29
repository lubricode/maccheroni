export interface AsyncFunction<X, Y> {
  (x: X): Promise<Y>;
}
