import { combineReducers, configureStore, Middleware } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import sliceReducer, { initialState } from './slices/slice';

const reducers = {
  account: sliceReducer,
};

export type Slice = keyof typeof reducers;
export type SliceStateType<T extends Slice> = SliceStateMap[T];
type SliceStateMap = {
  account: typeof initialState;
};

const rootReducer = combineReducers(reducers);

const middlewares: Middleware[] = [];

if (__DEV__) {
  const logger = createLogger({
    collapsed: true, // Collapse logs for better readability
  });
  middlewares.push(logger);
}

function middlewareOptions(options?: Record<string, unknown>) {
  return {
    ...options,
    thunk: { extraArgument: {} },
  };
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware(middlewareOptions()).concat(...middlewares),
});

export const setupStore = (preloadedState: Partial<RootState>, enableLogs: boolean = true) => {
  return configureStore({
    reducer: rootReducer,
    middleware: enableLogs
      ? getDefaultMiddleware => getDefaultMiddleware(middlewareOptions()).concat(...middlewares)
      : undefined,
    preloadedState,
  });
};

export type AppDispatch = typeof store.dispatch;
export type RootState = SliceStateMap;
export type AppStore = typeof store;
