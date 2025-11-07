export interface Observable<Value = unknown> {
  value: Value;

  getSafeValue(): Value;

  modify(modifier?: <T extends Value>(value: T) => T): void;

  addObserver(observer: (value: Value) => void): ObserverRemover;

  hasObservers(): boolean;
}

export type ObserverRemover = () => void;
