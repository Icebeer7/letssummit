export enum ContentStatus {
  LOADING = 0,
  NOT_AVAILABLE = 1,
  ERROR = 2,
  AVAILABLE = 3,
}

export namespace ContentStatus {
  export function desc(contentStatus: ContentStatus): string {
    switch (contentStatus) {
      case ContentStatus.LOADING:
        return 'loading';
      case ContentStatus.NOT_AVAILABLE:
        return 'not_available';
      case ContentStatus.ERROR:
        return 'error';
      case ContentStatus.AVAILABLE:
        return 'available';
    }
  }
}

export function isLoading(contentStatus: ContentStatus) {
  return contentStatus === ContentStatus.LOADING;
}

export function isError(contentStatus: ContentStatus) {
  return contentStatus === ContentStatus.ERROR;
}

export function isAvailable(contentStatus: ContentStatus) {
  return contentStatus === ContentStatus.AVAILABLE;
}

export function isNotLoaded(contentStatus: ContentStatus) {
  return contentStatus === ContentStatus.NOT_AVAILABLE;
}
