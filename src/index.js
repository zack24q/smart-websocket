function createEvent(type, args) {
  const event = new CustomEvent(type)
  Object.assign(event, args)
  return event
}

export default class SmartWebsocket {
  constructor(url, {
    autoOpen = true,
    smartSend = true,
    autoReconnect = true,
    reconnectDelay = 500,
    maxReconnectCount = 3,
  } = {}) {
    this._url = url
    this._autoOpen = autoOpen
    this._smartSend = smartSend
    this._autoReconnect = autoReconnect
    this._reconnectDelay = reconnectDelay
    this._maxReconnectCount = maxReconnectCount

    this._reconnectCount = 0
    this._forceClose = false
    this._bus = document.createElement('div')

    this.socket = null
    this.addEventListener = this._bus.addEventListener.bind(this._bus)
    this.removeEventListener = this._bus.removeEventListener.bind(this._bus)

    const reconnectHandler = () => {
      if (!this._forceClose) { // user don`t call close function
        this._reconnectCount += 1
        if (this._reconnectCount > this._maxReconnectCount) { // reconnect count reached the maximum
          this._bus.dispatchEvent(createEvent('reconnectStopped', {reconnectCount: this._reconnectCount}))
          this._reconnectCount = 0
        } else {
          setTimeout(() => {
            this.open()
          }, this._reconnectDelay)
        }
      } else { // user call close function
        this._forceClose = false
        this._reconnectCount = 0
      }
    }

    this._autoReconnect && this.addEventListener('close', reconnectHandler)
    this._autoOpen && this.open()
  }

  open() {
    if (this.socket && this.socket.readyState === 1) { // socket is opened
      return
    }
    this.socket = new WebSocket(this._url)
    this._bus.dispatchEvent(createEvent('connecting', {reconnectCount: this._reconnectCount}))

    this.socket.addEventListener('open', () => {
      this._bus.dispatchEvent(createEvent('open', {reconnectCount: this._reconnectCount}))
      this._reconnectCount = 0
    })
    this.socket.addEventListener('message', ({data, origin, lastEventId, source, ports}) => {
      this._bus.dispatchEvent(createEvent('message', {reconnectCount: this._reconnectCount, data, origin, lastEventId, source, ports}))
    })
    this.socket.addEventListener('close', ({code, reason, wasClean}) => {
      this._bus.dispatchEvent(createEvent('close', {reconnectCount: this._reconnectCount, code, reason, wasClean}))
    })
    this.socket.addEventListener('error', () => {
      this._bus.dispatchEvent(createEvent('error', {reconnectCount: this._reconnectCount}))
    })
  }

  close() {
    if (this.socket) {
      this._forceClose = true
      this.socket.close()
    }
  }

  send(data) {
    if (!this.socket || (this.socket.readyState === 0 && this._smartSend)) {
      this.addEventListener('open', () => {
        this.socket.send(data)
      }, {once: true})
    } else {
      this.socket.send(data)
    }
  }
}
