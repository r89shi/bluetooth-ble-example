import { useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';

import { bleContext } from '../../context/bleContext';
import { useBle } from '../../services/bluetooth';

import { COMMAND } from '../../constants/commands';
import { BLUETOOTHUUID } from '../../constants/bluetoothUUID';

export default function Home() {
  const { isPermission, connectedDevice, setConnectedDevice } = bleContext();
  const {
    allDevices,
    connectToDevice,
    disconnectFromDevice,
    scanForPeripherals,
    startStreamingData,
    stopScanDevice,
    checkDeviceConnection
  } = useBle();

  console.log(`connectedDevice: [${connectedDevice?.id}]`);

  /**
   * Send data to device
   *
   * @param {string}
   * @returns {Promise<void>}
   */
  async function sendData(cmd: string): Promise<void> {
    if (!connectedDevice) {
      return;
    }

    const isConnected = await checkDeviceConnection({
      device: connectedDevice
    });

    if (isConnected !== 200) {
      const reconResponse = await reConnect(connectedDevice);
      console.log(`[+] Reconnection device status: ${reconResponse}`);
    }

    const response = await startStreamingData({
      device: connectedDevice,
      command: cmd
    });

    console.log(`Send data: ${response}`);
  }

  /**
   * Check if device is connected if not reconnect to device
   *
   * @param {NBle.TDevice}
   * @returns {Promise<number>}
   */
  async function reConnect(device: NBle.TDevice): Promise<number> {
    const isConnected = await checkDeviceConnection({ device });

    if (isConnected === 200) {
      console.log('[+] Device is connected');
      return new Promise((resolve, reject) => {
        resolve(200);
      });
    }

    const disconnectResponse = await disconnect(device);
    console.log(`Disconnect Response: ${disconnectResponse}`);

    if (disconnectResponse === 400 || disconnectResponse === 200) {
      const response = await seletecDeviceOnList(device);
      console.log(`Connect Response: ${response}`);
    }

    return new Promise((resolve, reject) => {
      resolve(200);
    });
  }

  /**
   * Disconnect from device
   *
   * @param {NBle.TDevice}
   * @returns {Promise<number>}
   */
  async function disconnect(device: NBle.TDevice): Promise<number> {
    if (!connectedDevice || !setConnectedDevice) {
      return new Promise((resolve, reject) => {
        resolve(401);
      });
    }

    return await disconnectFromDevice({
      connectedDevice: device,
      setConnectedDevice
    });
  }

  /**
   * Connect on device
   *
   * @param {NBle.TDevice}
   * @returns {Promise<number>}
   */
  async function seletecDeviceOnList(device: NBle.TDevice): Promise<number> {
    if (!setConnectedDevice) {
      return new Promise((resolve, reject) => {
        resolve(400);
      });
    }

    const response = await connectToDevice({
      device,
      connectedDevice,
      setConnectedDevice
    });
    return new Promise((resolve, reject) => {
      resolve(response);
    });
  }

  /**
   * Check if device is connected
   *
   * @param {NBle.TDevice}
   * @returns {Promise<void>}
   */
  async function checkConnection(device: NBle.TDevice): Promise<void> {
    const response = await checkDeviceConnection({ device });

    console.log(`Device connection state: ${response}`);
  }

  useEffect(() => {
    if (!isPermission) {
      Alert.alert('Erro de permissao', 'Bluetooth sem permissao');
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.buttonsScan}>
        <Button
          title="Scan"
          color="#65CAAB"
          onPress={() => {
            scanForPeripherals();
          }}
        ></Button>

        <Button
          title="Stop Scan"
          color="#FC5C81"
          onPress={() => {
            stopScanDevice();
          }}
        ></Button>
      </View>

      <View style={styles.buttons}>
        <Button
          title="Start"
          onPress={() => {
            sendData(COMMAND.START);
          }}
        ></Button>

        <Button
          title="Pause"
          onPress={() => {
            sendData(COMMAND.PAUSE);
          }}
        ></Button>

        <Button
          title="Reset"
          onPress={() => {
            sendData(COMMAND.CROSS);
          }}
        ></Button>

        <Button
          title="Up"
          onPress={() => {
            sendData(COMMAND.UP);
          }}
        ></Button>

        <Button
          title="Down"
          onPress={() => {
            sendData(COMMAND.DOWN);
          }}
        ></Button>
      </View>

      {!!connectedDevice ? (
        <View style={styles.buttonsConn}>
          <Button
            title={`Reconnect:\n${connectedDevice.name}`}
            key={`re-${connectedDevice.id}`}
            color="#656AAB"
            onPress={() => {
              reConnect(connectedDevice);
            }}
          ></Button>
          <Button
            title={`Disconnect: \n${connectedDevice.name}`}
            key={`con-${connectedDevice.id}`}
            color="#FC5C81"
            onPress={() => {
              disconnect(connectedDevice);
            }}
          ></Button>
          <Button
            title={`Check\nconnection`}
            key={`ch-${connectedDevice.id}`}
            color="#65CAAB"
            onPress={() => {
              checkConnection(connectedDevice);
            }}
          ></Button>
        </View>
      ) : (
        <View style={styles.buttons}>
          {allDevices.map((device, index) => {
            return (
              <Button
                title={`${device.name}`}
                color="#65CAAB"
                onPress={() => seletecDeviceOnList(device)}
                key={`dev_${index}`}
              ></Button>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 20,
    marginHorizontal: 20
  },
  root: {
    flex: 1,
    alignItems: 'center',
    rowGap: 40
  },
  titulo: {
    color: '#fff',
    marginTop: 20,
    fontWeight: '500',
    fontSize: 26
  },
  buttons: {
    rowGap: 20,
    width: '100%',
    marginBottom: 40
  },
  buttonsConn: {
    rowGap: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  buttonsScan: {
    columnGap: 20,
    marginBottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center'
  }
});
