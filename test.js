const tape = require('tape')
const xbee = require('.')

tape('local at command request frame with value', t => {
  const frame = xbee.encode({
    type: xbee.FrameType.LOCAL_AT_COMMAND_REQUEST,
    id: 14,
    command: 'NI',
    value: new Uint8Array([0xa1, 0xb2])
  })

  t.equal(xbee.encode.bytes, 10)
  t.deepEqual(frame, new Uint8Array([
    0x7e, 0x00, 0x06, 0x08,
    0x0e, 0x4e, 0x49, 0xa1,
    0xb2, 0xff
  ]))

  const obj = xbee.decode(frame)

  t.equal(xbee.decode.bytes, 10)
  t.deepEqual(obj, {
    type: xbee.FrameType.LOCAL_AT_COMMAND_REQUEST,
    id: 14,
    command: 'NI',
    value: new Uint8Array([0xa1, 0xb2])
  })

  t.end()
})

tape('local at command request frame without value', t => {
  const frame = xbee.encode({
    type: xbee.FrameType.LOCAL_AT_COMMAND_REQUEST,
    id: 14,
    command: 'NI'
  })

  t.equal(xbee.encode.bytes, 8)
  t.deepEqual(frame, new Uint8Array([
    0x7e, 0x00, 0x04, 0x08,
    0x0e, 0x4e, 0x49, 0x52
  ]))

  const obj = xbee.decode(frame)

  t.equal(xbee.decode.bytes, 8)
  t.deepEqual(obj, {
    type: xbee.FrameType.LOCAL_AT_COMMAND_REQUEST,
    id: 14,
    command: 'NI'
  })

  t.end()
})

tape('local at command response frame with value', t => {
  const frame = xbee.encode({
    type: xbee.FrameType.LOCAL_AT_COMMAND_RESPONSE,
    id: 14,
    command: 'NI',
    status: xbee.ATCommandStatus.ERROR,
    value: new Uint8Array([0xa1, 0xb2])
  })

  t.equal(xbee.encode.bytes, 11)
  t.deepEqual(frame, new Uint8Array([
    0x7e, 0x00, 0x07, 0x88,
    0x0e, 0x4e, 0x49, 0x01,
    0xa1, 0xb2, 0x7e
  ]))

  const obj = xbee.decode(frame)

  t.equal(xbee.decode.bytes, 11)
  t.deepEqual(obj, {
    type: xbee.FrameType.LOCAL_AT_COMMAND_RESPONSE,
    id: 14,
    command: 'NI',
    status: xbee.ATCommandStatus.ERROR,
    value: new Uint8Array([0xa1, 0xb2])
  })

  t.end()
})

tape('local at command response frame without value', t => {
  const frame = xbee.encode({
    type: xbee.FrameType.LOCAL_AT_COMMAND_RESPONSE,
    id: 14,
    command: 'NI',
    status: xbee.ATCommandStatus.ERROR
  })

  t.equal(xbee.encode.bytes, 9)
  t.deepEqual(frame, new Uint8Array([
    0x7e, 0x00, 0x05, 0x88,
    0x0e, 0x4e, 0x49, 0x01,
    0xd1
  ]))

  const obj = xbee.decode(frame)

  t.equal(xbee.decode.bytes, 9)
  t.deepEqual(obj, {
    type: xbee.FrameType.LOCAL_AT_COMMAND_RESPONSE,
    id: 14,
    command: 'NI',
    status: xbee.ATCommandStatus.ERROR
  })

  t.end()
})

tape('user data relay input', t => {
  const frame = xbee.encode({
    type: xbee.FrameType.USER_DATA_RELAY_INPUT,
    id: 14,
    destination: xbee.Interface.MICROPYTHON,
    data: new Uint8Array([0xa1, 0xb2])
  })

  t.equal(xbee.encode.bytes, 9)
  t.deepEqual(frame, new Uint8Array([
    0x7e, 0x00, 0x05, 0x2d,
    0x0e, 0x02, 0xa1, 0xb2,
    0x6f
  ]))

  const obj = xbee.decode(frame)

  t.equal(xbee.decode.bytes, 9)
  t.deepEqual(obj, {
    type: xbee.FrameType.USER_DATA_RELAY_INPUT,
    id: 14,
    destination: xbee.Interface.MICROPYTHON,
    data: new Uint8Array([0xa1, 0xb2])
  })

  t.end()
})

tape('transmit status', t => {
  const frame = xbee.encode({
    type: xbee.FrameType.TRANSMIT_STATUS,
    id: 14,
    status: xbee.DeliveryStatus.INVALID_INTERFACE
  })

  t.equal(xbee.encode.bytes, 7)
  t.deepEqual(frame, new Uint8Array([
    0x7e, 0x00, 0x03, 0x89,
    0x0e, 0x7c, 0xec
  ]))

  const obj = xbee.decode(frame)

  t.equal(xbee.decode.bytes, 7)
  t.deepEqual(obj, {
    type: xbee.FrameType.TRANSMIT_STATUS,
    id: 14,
    status: xbee.DeliveryStatus.INVALID_INTERFACE
  })

  t.end()
})

;[
  [xbee.FrameType.BLE_UNLOCK_REQUEST, 0x2c, 0x52],
  [xbee.FrameType.BLE_UNLOCK_RESPONSE, 0xac, 0xd2]
].forEach(([type, expectedType, expectedChecksum]) => {
  tape(`ble unlock type ${type} step 1`, t => {
    const frame = xbee.encode({
      type: type,
      step: 1,
      clientEphemeral: (new Uint8Array(128)).fill(0xcd)
    })

    t.equal(xbee.encode.bytes, 134)
    t.deepEqual(frame, new Uint8Array([
      0x7e, 0x00, 0x82, expectedType,
      0x01, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, 0xcd, 0xcd, 0xcd,
      0xcd, expectedChecksum
    ]))

    const obj = xbee.decode(frame)

    t.equal(xbee.decode.bytes, 134)
    t.deepEqual(obj, {
      type: type,
      step: 1,
      clientEphemeral: (new Uint8Array(128)).fill(0xcd)
    })

    t.end()
  })
})

;[
  [xbee.FrameType.BLE_UNLOCK_REQUEST, 0x2c, 0x21],
  [xbee.FrameType.BLE_UNLOCK_RESPONSE, 0xac, 0xa1]
].forEach(([type, expectedType, expectedChecksum]) => {
  tape(`ble unlock type ${type} step 2`, t => {
    const frame = xbee.encode({
      type: type,
      step: 2,
      salt: (new Uint8Array(4)).fill(0xcc),
      serverEphemeral: (new Uint8Array(128)).fill(0xcb)
    })

    t.equal(xbee.encode.bytes, 138)
    t.deepEqual(frame, new Uint8Array([
      0x7e, 0x00, 0x86, expectedType,
      0x02, 0xcc, 0xcc, 0xcc,
      0xcc, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, 0xcb, 0xcb, 0xcb,
      0xcb, expectedChecksum
    ]))

    const obj = xbee.decode(frame)

    t.equal(xbee.decode.bytes, 138)
    t.deepEqual(obj, {
      type: type,
      step: 2,
      salt: (new Uint8Array(4)).fill(0xcc),
      serverEphemeral: (new Uint8Array(128)).fill(0xcb)
    })

    t.end()
  })
})

;[
  [xbee.FrameType.BLE_UNLOCK_REQUEST, 0x2c, 0x10],
  [xbee.FrameType.BLE_UNLOCK_RESPONSE, 0xac, 0x90]
].forEach(([type, expectedType, expectedChecksum]) => {
  tape(`ble unlock type ${type} step 3`, t => {
    const frame = xbee.encode({
      type: type,
      step: 3,
      clientSessionProof: (new Uint8Array(32)).fill(0xce)
    })

    t.equal(xbee.encode.bytes, 38)
    t.deepEqual(frame, new Uint8Array([
      0x7e, 0x00, 0x22, expectedType,
      0x03, 0xce, 0xce, 0xce,
      0xce, 0xce, 0xce, 0xce,
      0xce, 0xce, 0xce, 0xce,
      0xce, 0xce, 0xce, 0xce,
      0xce, 0xce, 0xce, 0xce,
      0xce, 0xce, 0xce, 0xce,
      0xce, 0xce, 0xce, 0xce,
      0xce, 0xce, 0xce, 0xce,
      0xce, expectedChecksum
    ]))

    const obj = xbee.decode(frame)

    t.equal(xbee.decode.bytes, 38)
    t.deepEqual(obj, {
      type: type,
      step: 3,
      clientSessionProof: (new Uint8Array(32)).fill(0xce)
    })

    t.end()
  })
})

;[
  [xbee.FrameType.BLE_UNLOCK_REQUEST, 0x2c, 0x63],
  [xbee.FrameType.BLE_UNLOCK_RESPONSE, 0xac, 0xe3]
].forEach(([type, expectedType, expectedChecksum]) => {
  tape(`ble unlock type ${type} step 4`, t => {
    const frame = xbee.encode({
      type: type,
      step: 4,
      serverSessionProof: (new Uint8Array(32)).fill(0xcf),
      txNonce: (new Uint8Array(12)).fill(0xd0),
      rxNonce: (new Uint8Array(12)).fill(0xd1)
    })

    t.equal(xbee.encode.bytes, 62)
    t.deepEqual(frame, new Uint8Array([
      0x7e, 0x00, 0x3a, expectedType,
      0x04, 0xcf, 0xcf, 0xcf,
      0xcf, 0xcf, 0xcf, 0xcf,
      0xcf, 0xcf, 0xcf, 0xcf,
      0xcf, 0xcf, 0xcf, 0xcf,
      0xcf, 0xcf, 0xcf, 0xcf,
      0xcf, 0xcf, 0xcf, 0xcf,
      0xcf, 0xcf, 0xcf, 0xcf,
      0xcf, 0xcf, 0xcf, 0xcf,
      0xcf, 0xd0, 0xd0, 0xd0,
      0xd0, 0xd0, 0xd0, 0xd0,
      0xd0, 0xd0, 0xd0, 0xd0,
      0xd0, 0xd1, 0xd1, 0xd1,
      0xd1, 0xd1, 0xd1, 0xd1,
      0xd1, 0xd1, 0xd1, 0xd1,
      0xd1, expectedChecksum
    ]))

    const obj = xbee.decode(frame)

    t.equal(xbee.decode.bytes, 62)
    t.deepEqual(obj, {
      type: type,
      step: 4,
      serverSessionProof: (new Uint8Array(32)).fill(0xcf),
      txNonce: (new Uint8Array(12)).fill(0xd0),
      rxNonce: (new Uint8Array(12)).fill(0xd1)
    })

    t.end()
  })
})

;[
  [xbee.FrameType.BLE_UNLOCK_REQUEST, 0x2c, 0x52],
  [xbee.FrameType.BLE_UNLOCK_RESPONSE, 0xac, 0xd2]
].forEach(([type, expectedType, expectedChecksum]) => {
  tape(`ble unlock type ${type} step error`, t => {
    const frame = xbee.encode({
      type: type,
      step: xbee.StepError.INCORRECT_PAYLOAD_LENGTH
    })

    t.equal(xbee.encode.bytes, 6)
    t.deepEqual(frame, new Uint8Array([
      0x7e, 0x00, 0x02, expectedType,
      0x81, expectedChecksum
    ]))

    const obj = xbee.decode(frame)

    t.equal(xbee.decode.bytes, 6)
    t.deepEqual(obj, {
      type: type,
      step: xbee.StepError.INCORRECT_PAYLOAD_LENGTH
    })

    t.end()
  })
})
