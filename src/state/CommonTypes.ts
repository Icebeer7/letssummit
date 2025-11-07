export interface ErrorObject<ErrorContextType = unknown> {
  type: string;
  errorInt: number;
  userDisplayErrorStr: string;
  userDisplayErrorCode: number;
  errorContext?: ErrorContextType;
  errorStr: string;
  httpStatus: string;
  dynamicMessageKey?: string;
}
