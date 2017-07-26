# smart-websocket

[![npm](https://img.shields.io/npm/v/smart-websocket.svg)](https://www.npmjs.com/package/smart-websocket)
[![npm](https://img.shields.io/npm/dm/smart-websocket.svg)](https://www.npmjs.com/package/smart-websocket)

### Features

- autoReconnect: In non-user disconnected case, the websocket is automatically reconnected after disconnecting
- smartSend: The message will not be sent until the Websocket is opened

### DEMO

[DEMO](https://zack24q.github.io/smart-websocket/examples/)

[CODE](https://github.com/zack24q/smart-websocket/tree/master/examples)

## Installing

```bash
npm i -S smart-websocket
```

or

```bash
yarn add smart-websocket
```

## Usage

```javascript
import SmartWebsocket from 'smart-websocket'

let socket = new SmartWebsocket(URL, OPTIONS)
```

## Options

```javascript
defaultOptions = {
  autoOpen: true,
  smartSend: true,
  autoReconnect: true,
  reconnectDelay: 500,
  maxReconnectCount: 3
}
```

## Methods

```javascript
socket.open()
socket.send(data)
socket.close()
```

## Events

```javascript
socket.addEventListener('connecting', ({reconnectCount}) => {})
socket.addEventListener('open', ({reconnectCount}) => {}) // When the connection is successfully opened, reconnectCount will be set to 0
socket.addEventListener('close', ({reconnectCount}) => {})
socket.addEventListener('error', ({reconnectCount}) => {})
socket.addEventListener('message', ({reconnectCount}) => {})
```
