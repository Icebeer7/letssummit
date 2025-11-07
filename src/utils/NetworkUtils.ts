import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import { Log } from './Log';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
let networkCheckDone = false;

export async function fetchReliableNetInfo(
  maxRetries = 3,
  intervalMs = 500,
): Promise<ReturnType<typeof NetInfo.fetch>> {
  // Retrying for the interval to fix the race condition that NetInfo has with app startup. Usually takes 300-500ms for network modules to setup after app launch.
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    let internetStatus;
    if (networkCheckDone) {
      internetStatus = await NetInfo.refresh();
    } else {
      networkCheckDone = true;
      internetStatus = await NetInfo.fetch();
    }

    const isEmulator = await DeviceInfo.isEmulator();
    const internetAvailable = isEmulator
      ? internetStatus.isConnected
      : internetStatus.isInternetReachable;

    const isValid =
      internetAvailable &&
      internetStatus.type !== NetInfoStateType.unknown &&
      internetStatus.type !== NetInfoStateType.none;

    if (isValid) {
      return internetStatus;
    }

    await wait(intervalMs);
  }

  return NetInfo.fetch(); // Return whatever result we get after retries are done.
}

export async function isInternetReachable(): Promise<boolean> {
  try {
    const internetStatus = await fetchReliableNetInfo(1, 200);

    const isEmulator = await DeviceInfo.isEmulator();
    const internetAvailable = isEmulator
      ? internetStatus.isConnected
      : internetStatus.isInternetReachable;

    // Note: In case we don't get the result, we will assume internet connectivity is present.

    if (internetAvailable !== null && internetAvailable !== undefined) {
      Log.v('Network Status : ', internetAvailable);
      return internetAvailable;
    } else {
      Log.d('Network Status Unknown, assuming available.');
      return true;
    }
  } catch (error) {
    Log.e('Error trying to fetch internet status:', error);
    // Note: In case we don't get the result, we will assume internet connectivity is present.
    return true;
  }
}
