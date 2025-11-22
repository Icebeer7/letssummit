export type Point = { x: number; y: number };

export type FontWeightNumeric = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type FontWeightType =
  | FontWeightNumeric
  | 'normal'
  | 'bold'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | 'ultralight'
  | 'thin'
  | 'light'
  | 'medium'
  | 'regular'
  | 'semibold'
  | 'condensedBold'
  | 'condensed'
  | 'heavy'
  | 'black'
  | undefined;
