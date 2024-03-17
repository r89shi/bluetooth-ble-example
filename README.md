![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)

# 🛠️ Requirements

Before start, check if you have the Android Studio.

[**Download Android Studio**](https://developer.android.com/studio?hl=pt-br)

# 🚀 Installation

## 1. Clone the repository

```
git clone https://github.com/r89shi/bluetooth-ble-example.git
```

## 2. Install the dependencies

> [!WARNING]  
> For some reason the **pnpm** does not work, so if you have some error like **Register Component** problably that is the reason.

> [!IMPORTANT]
> Before install remove the package: **@config-plugins/react-native-ble-plx** from the **packege.json** file.
>
> I do recommend, first install all others packages using the **npx expo install**, after that install the **@config-plugins/react-native-ble-plx** using **npm** or **yarn**

### Install packages

```
npx expo install
```

### Install config-plugins

```
npm install @config-plugins/react-native-ble-plx
```

or

```
yarn install @config-plugins/react-native-ble-plx
```

## 3. Open the Android Studio

Open the Android Studio and start one Android Emulator.

## 4. Prepare project

Export the Android folder from the project.

```
npx expo prebuild
```

## 4. Run the start

Start the project and let it running to create an auto link.

> [!NOTE]
> Make this step only in the first initialization, after that it is not necessary.

```
npm start
```

or

```
yarn start
```

## 4. Run the android

For this step connect a physical device on USB.

```
npm android
```

or

```
yarn android
```
