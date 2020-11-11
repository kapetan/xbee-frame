# xbee-frame

XBee API frame encoder and decoder.

    npm install xbee-frame

## Usage

The module exposes the `encode`, `decode` and `encodingLength` functions as well as constants used in the frames. All binary data is handled with `Uint8Array` buffers.

```js
const { encode, decode, FrameType } = require('xbee-frame')

// Returns Uint8Array with frame content
const buffer = encode({
  type: FrameType.LOCAL_AT_COMMAND_REQUEST,
  id: 1,
  command: 'NI'
})

console.log(buffer) // [0x7e, 0x00, 0x04, 0x08, ...]

const obj = decode(buffer)

console.log(obj) // { type: 0x08, id: 1, command: 'NI' }
````

## API

#### `encode(obj, [buffer], [offset])`

Encodes the object frame into the buffer beginning at specified byte offset. If no buffer is provided a new one is allocated. The byte offset defaults to 0.

After the encoding `encode.bytes` is set to the amount of bytes used to encode the object.

#### `decode(buffer, [start], [end])`

Returns the decoded object frame from the buffer, beginning at specified byte offset given by the second argument. An optional end offset can be passed, and defaults to the buffer length.

After the decoding `encode.bytes` is set to the amount of bytes used to decode the object.

#### `encodingLength(obj)`

Returns the amount of bytes needed to encode the passed object frame.

#### `FrameType`

Valid frame types.

- `LOCAL_AT_COMMAND_REQUEST (0x08)`
- `BLE_UNLOCK_REQUEST (0x2c)`
- `USER_DATA_RELAY_INPUT (0x2d)`
- `LOCAL_AT_COMMAND_RESPONSE (0x88)`
- `TRANSMIT_STATUS (0x89)`
- `BLE_UNLOCK_RESPONSE (0xac)`

#### `ATCommandStatus`

Valid AT command status codes. Used with the *Local AT Command Response* frame.

- `OK (0)`
- `ERROR (1)`
- `INVALID_COMMAND (2)`
- `INVALID_PARAMETER (3)`

#### `Interface`

Valid interface values. Used with the *User Data Relay Input* frame.

- `SERIAL (0)`
- `BLE (1)`
- `MICROPYTHON (2)`

#### `DeliveryStatus`

Used with the *Transmit Status* frame.

## Frames

#### Local AT Command Request

The value property is optional.

```txt
{
  type: FrameType.LOCAL_AT_COMMAND_REQUEST,
  id: Number,
  command: String,
  [value: Uint8Array]
}
````

#### BLE Unlock Request/Response

The frame payload depends on the step value.

```txt
{
  type: FrameType.BLE_UNLOCK_REQUEST | FrameType.BLE_UNLOCK_RESPONSE,
  step: 1,
  clientEphemeral: Uint8Array(128)
}
````

```txt
{
  type: FrameType.BLE_UNLOCK_REQUEST | FrameType.BLE_UNLOCK_RESPONSE,
  step: 2,
  salt: Uint8Array(4),
  serverEphemeral: Uint8Array(128)
}
````

```txt
{
  type: FrameType.BLE_UNLOCK_REQUEST | FrameType.BLE_UNLOCK_RESPONSE,
  step: 3,
  clientSessionProof: Uint8Array(32)
}
````

```txt
{
  type: FrameType.BLE_UNLOCK_REQUEST | FrameType.BLE_UNLOCK_RESPONSE,
  step: 4,
  serverSessionProof: Uint8Array(32),
  txNonce: Uint8Array(12),
  rxNonce: Uint8Array(12)
}
````

#### User Data Relay Input

```txt
{
  type: FrameType.USER_DATA_RELAY_INPUT,
  id: Number,
  destination: Interface,
  data: Uint8Array
}
````

#### Transmit Status

Get the string description of the status by calling `DeliveryStatus.getName(status)`.

```txt
{
  type: FrameType.TRANSMIT_STATUS,
  id: Number,
  status: DeliveryStatus
}
````

#### Local AT Command Response

The value property is optional. Get the string description of the status by calling `ATCommandStatus.getName(status)`.

```txt
{
  type: FrameType.LOCAL_AT_COMMAND_RESPONSE,
  id: Number,
  command: String,
  status: ATCommandStatus,
  [value: Uint8Array]
}
````
