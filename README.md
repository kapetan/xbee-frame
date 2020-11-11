# xbee-frame

XBee API frame encoder and decoder.

    npm install xbee-frame

## Usage

The module exposes the `encode(obj, [buffer], [offset])`, `decode(buffer, [start], [end])` and `encodingLength(obj)` functions. All binary data is handled with `Uint8Array` buffers.

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
