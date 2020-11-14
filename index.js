const START_DELIMITER = 0x7e

const FrameType = {
  LOCAL_AT_COMMAND_REQUEST: 0x08,
  BLE_UNLOCK_REQUEST: 0x2c,
  USER_DATA_RELAY_INPUT: 0x2d,
  LOCAL_AT_COMMAND_RESPONSE: 0x88,
  TRANSMIT_STATUS: 0x89,
  BLE_UNLOCK_RESPONSE: 0xac,
  USER_DATA_RELAY_OUTPUT: 0xad,
  getName: getName
}

const ATCommandStatus = {
  OK: 0,
  ERROR: 1,
  INVALID_COMMAND: 2,
  INVALID_PARAMETER: 3,
  getName: getName
}

const Interface = {
  SERIAL: 0,
  BLE: 1,
  MICROPYTHON: 2,
  getName: getName
}

const StepError = {
  UNABLE_TO_OFFER_B: 0x80,
  INCORRECT_PAYLOAD_LENGTH: 0x81,
  BAD_PROOF_OF_KEY: 0x82,
  RESOURCE_ALLOCATION_ERROR: 0x83,
  STEP_OUT_OF_SEQUENCE: 0x84,
  getName: getName
}

const DeliveryStatus = {
  SUCCESS: 0x00,
  NO_ACK_RECEIVED: 0x01,
  CCA_FAILURE: 0x02,
  INDIRECT_MESSAGE_UNREQUESTED: 0x03,
  TRANSCEIVER_UNABLE_TO_COMPLETE_TRANSMISSION: 0x04,
  NETWORK_ACK_FAILURE: 0x21,
  NOT_JOINED_TO_NETWORK: 0x22,
  INVALID_FRAME_VALUES: 0x2c,
  INTERNAL_ERROR: 0x31,
  RESOURCE_ERROR: 0x32,
  NO_SECURE_SESSION_CONNECTION: 0x34,
  ENCRYPTION_FAILURE: 0x35,
  MESSAGE_TOO_LONG: 0x74,
  SOCKET_CLOSED_UNEXPECTEDLY: 0x76,
  INVALID_UDP_PORT: 0x78,
  INVALID_TCP_PORT: 0x79,
  INVALID_HOST_ADDRESS: 0x7a,
  INVALID_DATA_MODE: 0x7b,
  INVALID_INTERFACE: 0x7c,
  INTERFACE_NOT_ACCEPTING_FRAMES: 0x7d,
  A_MODEM_UPDATE_IS_IN_PROGRESS: 0x7e,
  CONNECTION_REFUSED: 0x80,
  SOCKET_CONNECTION_LOST: 0x81,
  NO_SERVER: 0x82,
  SOCKET_CLOSED: 0x83,
  UNKNOWN_SERVER: 0x84,
  UNKNOWN_ERROR: 0x85,
  INVALID_TLS_CONFIGURATION: 0x86,
  SOCKET_NOT_CONNECTED: 0x87,
  SOCKET_NOT_BOUND: 0x88,
  getName: getName
}

function getName (i) {
  for (const name in this) {
    if (Object.prototype.hasOwnProperty.call(this, name) && this[name] === i) return name
  }
}

function checksum (buffer, start, end) {
  let sum = 0

  for (let i = start; i < end; i++) {
    sum += buffer[i]
  }

  return 0xff - (sum & 0xff)
}

function encode (obj, buffer, offset) {
  const length = encodingLength(obj)

  if (!offset) offset = 0
  if (!buffer) buffer = new Uint8Array(length)

  if (offset + length > buffer.length) throw new RangeError('offset and length out of bounds')

  buffer[offset] = START_DELIMITER
  buffer[offset + 1] = ((length - 4) >> 8) & 0xff
  buffer[offset + 2] = (length - 4) & 0xff
  buffer[offset + 3] = obj.type

  switch (obj.type) {
    case FrameType.LOCAL_AT_COMMAND_REQUEST:
      buffer[offset + 4] = obj.id & 0xff
      buffer[offset + 5] = obj.command.charCodeAt(0)
      buffer[offset + 6] = obj.command.charCodeAt(1)
      if (obj.value) buffer.set(obj.value, offset + 7)

      break
    case FrameType.BLE_UNLOCK_REQUEST:
    case FrameType.BLE_UNLOCK_RESPONSE:
      buffer[offset + 4] = obj.step

      switch (obj.step) {
        case 1:
          buffer.set(obj.clientEphemeral.slice(0, 128), offset + 5)
          break
        case 2:
          buffer.set(obj.salt.slice(0, 4), offset + 5)
          buffer.set(obj.serverEphemeral.slice(0, 128), offset + 9)
          break
        case 3:
          buffer.set(obj.clientSessionProof.slice(0, 32), offset + 5)
          break
        case 4:
          buffer.set(obj.serverSessionProof.slice(0, 32), offset + 5)
          buffer.set(obj.txNonce.slice(0, 12), offset + 37)
          buffer.set(obj.rxNonce.slice(0, 12), offset + 49)
          break
      }

      break
    case FrameType.USER_DATA_RELAY_INPUT:
      buffer[offset + 4] = obj.id & 0xff
      buffer[offset + 5] = obj.destination
      buffer.set(obj.data, offset + 6)

      break
    case FrameType.TRANSMIT_STATUS:
      buffer[offset + 4] = obj.id & 0xff
      buffer[offset + 5] = obj.status

      break
    case FrameType.LOCAL_AT_COMMAND_RESPONSE:
      buffer[offset + 4] = obj.id & 0xff
      buffer[offset + 5] = obj.command.charCodeAt(0)
      buffer[offset + 6] = obj.command.charCodeAt(1)
      buffer[offset + 7] = obj.status
      if (obj.value) buffer.set(obj.value, offset + 8)

      break
    case FrameType.USER_DATA_RELAY_OUTPUT:
      buffer[offset + 4] = obj.source
      buffer.set(obj.data, offset + 5)

      break
  }

  buffer[offset + length - 1] = checksum(buffer, offset + 3, length - 1)

  encode.bytes = length
  return buffer
}

function decode (buffer, start, end) {
  if (!end) end = buffer.length
  if (!start) start = 0

  // Five bytes expected: delimeter, length (2 bytes), frame type and checksum at the end
  if (start + 5 >= end) throw new RangeError('start and end are out of bounds')
  if (buffer[start] !== START_DELIMITER) throw new Error('expected start delimiter at index ' + start)
  if (checksum(buffer, start + 3, end - 1) !== buffer[end - 1]) throw new Error('invalid checksum at index ' + (end - 1))

  const length = (buffer[start + 1] << 8) | buffer[start + 2]
  const obj = { type: buffer[start + 3] }

  switch (obj.type) {
    case FrameType.LOCAL_AT_COMMAND_REQUEST:
      obj.id = buffer[start + 4]
      obj.command = String.fromCodePoint(buffer[start + 5], buffer[start + 6])
      if (length > 4) obj.value = buffer.slice(start + 7, start + length + 3)

      break
    case FrameType.BLE_UNLOCK_REQUEST:
    case FrameType.BLE_UNLOCK_RESPONSE:
      obj.step = buffer[start + 4]

      switch (obj.step) {
        case 1:
          obj.clientEphemeral = buffer.slice(start + 5, start + 133)
          break
        case 2:
          obj.salt = buffer.slice(start + 5, start + 9)
          obj.serverEphemeral = buffer.slice(start + 9, start + 137)
          break
        case 3:
          obj.clientSessionProof = buffer.slice(start + 5, start + 37)
          break
        case 4:
          obj.serverSessionProof = buffer.slice(start + 5, start + 37)
          obj.txNonce = buffer.slice(start + 37, start + 49)
          obj.rxNonce = buffer.slice(start + 49, start + 61)
          break
      }

      break
    case FrameType.USER_DATA_RELAY_INPUT:
      obj.id = buffer[start + 4]
      obj.destination = buffer[start + 5]
      obj.data = buffer.slice(start + 6, start + length + 3)

      break
    case FrameType.TRANSMIT_STATUS:
      obj.id = buffer[start + 4]
      obj.status = buffer[start + 5]

      break
    case FrameType.LOCAL_AT_COMMAND_RESPONSE:
      obj.id = buffer[start + 4]
      obj.command = String.fromCodePoint(buffer[start + 5], buffer[start + 6])
      obj.status = buffer[start + 7]
      if (length > 5) obj.value = buffer.slice(start + 8, start + length + 3)

      break
    case FrameType.USER_DATA_RELAY_OUTPUT:
      obj.source = buffer[start + 4]
      obj.data = buffer.slice(start + 5, start + length + 3)

      break
  }

  decode.bytes = end - start
  return obj
}

function encodingLength (obj) {
  switch (obj.type) {
    case FrameType.LOCAL_AT_COMMAND_REQUEST:
      return 8 + (obj.value ? obj.value.length : 0)
    case FrameType.BLE_UNLOCK_REQUEST:
    case FrameType.BLE_UNLOCK_RESPONSE:
      switch (obj.step) {
        case 1: return 134
        case 2: return 138
        case 3: return 38
        case 4: return 62
        default: return 6 // Assume error condition
      }
    case FrameType.USER_DATA_RELAY_INPUT:
      return 7 + obj.data.length
    case FrameType.TRANSMIT_STATUS:
      return 7
    case FrameType.LOCAL_AT_COMMAND_RESPONSE:
      return 9 + (obj.value ? obj.value.length : 0)
    case FrameType.USER_DATA_RELAY_OUTPUT:
      return 6 + obj.data.length
  }
}

exports.FrameType = FrameType
exports.ATCommandStatus = ATCommandStatus
exports.Interface = Interface
exports.StepError = StepError
exports.DeliveryStatus = DeliveryStatus
exports.encode = encode
exports.decode = decode
exports.encodingLength = encodingLength
