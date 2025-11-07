import { NoOptimizationInitialValue } from '../../hooks/UseSharedValueToStateConverter.hook';
import { SharedValue } from 'react-native-reanimated';
import { Observable, ObserverRemover } from './Observable';

export class SharedValueWrapper<Value = unknown> implements Observable<Value> {
  sharedValue: SharedValue<Value>;
  lastValueOnJS: Value;
  private observers: Array<(value: Value) => void>;

  constructor(
    sharedValue: SharedValue<Value>,
    initialValue: typeof NoOptimizationInitialValue | Value,
  ) {
    this.sharedValue = sharedValue;
    this.observers = [];
    this.lastValueOnJS =
      initialValue === NoOptimizationInitialValue ? sharedValue.get() : initialValue;
  }

  get value(): Value {
    'worklet';
    return this.sharedValue.value;
  }

  set value(newValue: Value) {
    'worklet';
    this.lastValueOnJS = newValue;
    this.observers.forEach(listener => listener(newValue));
    this.sharedValue.value = newValue;
  }

  getSafeValue(): Value {
    'worklet';
    return this.lastValueOnJS;
  }

  modify(modifier?: <T extends Value>(value: T) => T, forceUpdate?: boolean) {
    'worklet';
    this.sharedValue.modify(modifier, forceUpdate);
    if (modifier) {
      const newValue = modifier(this.sharedValue.value);
      this.lastValueOnJS = newValue;
      this.observers.forEach(listener => listener(newValue));
    }
  }

  addObserver(observer: (value: Value) => void): ObserverRemover {
    'worklet';
    this.observers.push(observer);
    return () => (this.observers = this.observers.filter(l => l !== observer));
  }

  hasObservers(): boolean {
    return this.observers.length > 0;
  }
}
