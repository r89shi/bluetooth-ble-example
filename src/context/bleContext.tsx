import { createContext, useContext, useState, useEffect } from 'react';
import { useBle } from '../services/bluetooth';

const BleContext = createContext<NBle.IBleContext>({});

export const bleContext = () => {
  return useContext(BleContext);
};

export const BleProvider = ({ children }: NBle.IBleProvider) => {
  const [isPermission, setIsPermission] = useState<boolean>(false);
  const [connectedDevice, setConnectedDevice] =
    useState<NBle.TDeviceNull>(null);

  const { requestPermissions } = useBle();

  useEffect(() => {
    if (!isPermission) {
      (async () => {
        setIsPermission(await requestPermissions());
      })();
    }
  }, []);

  const value = {
    isPermission,
    connectedDevice,
    setConnectedDevice
  };

  return <BleContext.Provider value={value}>{children}</BleContext.Provider>;
};
