import { createSlice } from '@reduxjs/toolkit';
import { ErrorObject } from '@state/CommonTypes';
import { ContentStatus } from '@state/ContentStatus';

export const initialState = {
  data: [] as string[],
  contentStatus: ContentStatus.NOT_AVAILABLE,
  error: undefined as undefined | ErrorObject,
};

const slice = createSlice({
  name: 'slice',
  initialState: initialState,
  reducers: {},
  extraReducers: () => {},
});

export default slice.reducer;
