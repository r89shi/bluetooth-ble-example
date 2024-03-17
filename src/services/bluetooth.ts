import { useMemo, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Characteristic, Device } from 'react-native-ble-plx';
import * as ExpoDevice from 'expo-device';
import base64 from 'react-native-base64';

import { BLUETOOTHUUID } from '../constants/bluetoothUUID';

export function useBle(): NBle.IUseBle {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);

  /**
   * Resquest permission for android 31
   */
  async function requestAndroid31Permissions() {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires Location',
        buttonPositive: 'OK'
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires Location',
        buttonPositive: 'OK'
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires Location',
        buttonPositive: 'OK'
      }
    );

    return (
      bluetoothScanPermission === 'granted' &&
      bluetoothConnectPermission === 'granted' &&
      fineLocationPermission === 'granted'
    );
  }

  /**
   * Request a device permission
   *
   * @returns {Promise<boolean>}
   */
  async function requestPermissions(): Promise<boolean> {
    console.log('[+] requestPermissions...');
    if (Platform.OS === 'android') {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth Low Energy requires Location',
            buttonPositive: 'OK'
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  }

  /**
   * Check if device exist in the list
   *
   * @param {NBle.IIsDuplicteDevice}
   * @returns {boolean}
   */
  function isDuplicteDevice(props: NBle.IIsDuplicteDevice): boolean {
    const { devices, nextDevice } = props;
    return devices.findIndex((device) => nextDevice.id === device.id) > -1;
  }

  /**
   * Scan for external ble devices
   */
  function scanForPeripherals() {
    console.log('[+] scanForPeripherals...');
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
        return;
      }

      if (
        device &&
        String(device.name).trim().length > 0 &&
        String(device.name) != 'null'
      ) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice({ devices: prevState, nextDevice: device })) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });
  }

  /**
   * Stop scanning
   */
  function stopScanDevice() {
    bleManager.stopDeviceScan();
  }

  /**
   * Connect to device
   *
   * @param {NBle.IConnectToDevice}
   * @returns {Promise<number>}
   */
  async function connectToDevice(
    props: NBle.IConnectToDevice
  ): Promise<number> {
    try {
      const { device, connectedDevice, setConnectedDevice } = props;
      let devId = device.id;

      if (!!connectedDevice) {
        devId = connectedDevice.id;
      }

      const deviceConnection = await bleManager.connectToDevice(devId);
      setConnectedDevice(deviceConnection);

      await deviceConnection.discoverAllServicesAndCharacteristics();
      stopScanDevice();

      return new Promise((resolve, reject) => {
        resolve(200);
      });
    } catch (error) {
      console.log('[+] connectToDevice error: ');
      console.log(error);
      return new Promise((resolve, reject) => {
        resolve(400);
      });
    } finally {
      setAllDevices([]);
    }
  }

  /**
   * Disconnect from current device
   *
   * @param {NBle.IDisconnectFromDevice}
   * @returns {Promise<number>}
   */
  async function disconnectFromDevice(
    props: NBle.IDisconnectFromDevice
  ): Promise<number> {
    const { connectedDevice, setConnectedDevice } = props;
    try {
      if (!connectedDevice) {
        return new Promise((resolve, reject) => {
          resolve(400);
        });
      }
      console.log('[+] Disconnecting');

      const response = await bleManager.cancelDeviceConnection(
        connectedDevice.id
      );

      // console.log(response);

      console.log(await checkDeviceConnection({ device: response }));

      // if (response === 200) {
      //   setConnectedDevice(null);
      // }

      return new Promise((resolve, reject) => {
        console.log('[+] Resolve');
        resolve(200);
      });
    } catch (error) {
      console.log('[+] disconnectFromDevice error:');
      console.log(error);
      return new Promise((resolve, reject) => {
        resolve(400);
      });
    }
  }

  /**
   * Sending data to device
   *
   * @param {NBle.IStartStreamingData}
   * @returns {Promise<number>}
   */
  async function startStreamingData(
    props: NBle.IStartStreamingData
  ): Promise<number> {
    const { device, command } = props;
    console.log('[+] startStreamingData...');

    try {
      if (!device) {
        console.log('[-] No device was founded.');
        return new Promise((resolve, reject) => {
          resolve(400);
        });
      }

      const commandB64 = base64.encode(command);
      console.log(`[+] Sending command: ${command} , ${commandB64}`);

      const response = await device.writeCharacteristicWithResponseForService(
        BLUETOOTHUUID.SERVICE,
        BLUETOOTHUUID.CHARACTERISTIC,
        commandB64
      );

      console.log(base64.decode(String(response.value)));

      return new Promise((resolve, reject) => {
        resolve(200);
      });
    } catch (error) {
      console.log('[+] startStreamingData error:');
      console.log(error);
      return new Promise((resolve, reject) => {
        resolve(400);
      });
    }
  }

  /**
   * Verify if device is connected
   *
   * @param {NBle.ICheckDeviceConnection}
   * @returns {Promise<number>}
   */
  async function checkDeviceConnection(
    props: NBle.ICheckDeviceConnection
  ): Promise<number> {
    const { device } = props;
    try {
      const response = await bleManager.isDeviceConnected(device.id);

      return new Promise((resolve, reject) => {
        resolve(!!response ? 200 : 400);
      });
    } catch (error) {
      console.log('[+] checkDeviceConnection error:');
      console.log(error);
      return new Promise((resolve, reject) => {
        resolve(400);
      });
    }
  }

  return {
    allDevices,
    requestPermissions,
    stopScanDevice,
    scanForPeripherals,
    connectToDevice,
    disconnectFromDevice,
    startStreamingData,
    checkDeviceConnection
  };
}
