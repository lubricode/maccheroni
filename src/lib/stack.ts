export class StackFrame<T> {
  constructor(public readonly value: T) {}
}

export class CaptureStackTrace<T> {
  readonly #frames: StackFrame<T>[];

  get frames(): StackFrame<T>[] {
    return [...this.#frames];
  }

  constructor(
    public readonly recorder: StackTraceRecorder<T>,
    ...frames: StackFrame<T>[]
  ) {
    this.#frames = frames;
  }
}

export class StackTrace<T> extends CaptureStackTrace<T> {
  capture(): this {
    this.recorder.capture(...this.frames);

    return this;
  }

  concat(...frames: StackFrame<T>[]) {
    return new StackTrace(this.recorder, ...this.frames, ...frames);
  }
}

export interface StackTraceRecord<T> {
  trace: CaptureStackTrace<T>;
}

export class StackTraceRecorder<T> {
  readonly #records: StackTraceRecord<T>[] = [];

  get records(): StackTraceRecord<T>[] {
    return [...this.#records];
  }

  capture(...frames: StackFrame<T>[]) {
    this.#records.push({
      trace: new CaptureStackTrace(this, ...frames),
    });
  }

  combineWith(recorder: StackTraceRecorder<T>) {
    for (const record of recorder.records) {
      this.capture(
        ...record.trace.frames.map((frame) => new StackFrame(frame.value))
      );
    }
  }

  trace(...frames: StackFrame<T>[]): StackTrace<T> {
    return new StackTrace(this, ...frames);
  }
}
