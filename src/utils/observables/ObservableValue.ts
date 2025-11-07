import { Observable, ObserverRemover } from './Observable';

export class ObservableValue<Value = unknown> implements Observable<Value> {
  private _value: Value;
  private _observers: Array<(value: Value) => void>;

  constructor(initialValue: Value) {
    this._value = initialValue;
    this._observers = [];
  }

  get value(): Value {
    return this._value;
  }

  set value(newValue: Value) {
    this._value = newValue;
    this._observers.forEach(listener => listener(newValue));
  }

  getSafeValue(): Value {
    return this._value;
  }

  modify(modifier?: <T extends Value>(value: T) => T): void {
    if (modifier) {
      const newValue = modifier(this._value);
      this._value = newValue;
      this._observers.forEach(listener => listener(newValue));
    }
  }

  addObserver(observer: (value: Value) => void): ObserverRemover {
    this._observers.push(observer);
    return () => {
      this._observers = this._observers.filter(l => l !== observer);
    };
  }

  hasObservers(): boolean {
    return this._observers.length > 0;
  }
}
