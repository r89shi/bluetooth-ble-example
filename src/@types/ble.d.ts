import { Device } from 'react-native-ble-plx';

export declare global {
  namespace NBle {
    type TDevice = Device;
    type TDeviceNull = Device | null | undefined;

    interface IBleContext {
      isPermission?: boolean;
      connectedDevice?: Device | null;
      setConnectedDevice?: (device: TDeviceNull) => void;
    }

    interface IBleProvider {
      children: ReactNode;
    }

    interface IUseBle {
      allDevices: TDevice[];
      requestPermissions: () => Promise<boolean>;
      scanForPeripherals: () => void;
      stopScanDevice: () => void;
      connectToDevice: (props: IConnectToDevice) => Promise<number>;
      disconnectFromDevice: (props: IDisconnectFromDevice) => Promise<number>;
      startStreamingData: (props: IStartStreamingData) => Promise<number>;
      checkDeviceConnection: (props: ICheckDeviceConnection) => Promise<number>;
    }

    interface IIsDuplicteDevice {
      devices: TDevice[];
      nextDevice: TDevice;
    }

    interface IConnectToDevice {
      device: TDevice;
      connectedDevice: TDeviceNull;
      setConnectedDevice: (device: TDeviceNull) => void;
    }

    interface IDisconnectFromDevice {
      connectedDevice: TDeviceNull;
      setConnectedDevice: (device: TDeviceNull) => void;
    }

    interface IStartStreamingData {
      device: TDevice;
      command: string;
    }

    interface ICheckDeviceConnection {
      device: TDevice;
    }
  }
}
