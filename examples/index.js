// import SmartWebsocket from '../src'
import SmartWebsocket from '../dist/smart-websocket.esm'

function decode(data) {
  const match = data.match(/\[.*\]/)
  if (match) {
    const array = JSON.parse(match[0])
    return {
      type: array[0],
      data: array[1]
    }
  } else {
    return null
  }
}

new Vue({
  el: '#app',
  data: {
    name: '',
    socket: null,
    messages: [],
    msg: '',
  },
  mounted() {
    this.name = prompt('Type your nickname') || 'Anonymous'

    this.socket = new SmartWebsocket('wss://socketio-chat.now.sh/socket.io/?EIO=3&transport=websocket')
    this.socket.send(`42["add user","${this.name}"]`)

    this.socket.addEventListener('open', ({reconnectCount}) => {
      this.messages.push({
        type: 'system',
        message: `socket open, reconnectCount: ${reconnectCount}`
      })
    })
    this.socket.addEventListener('close', ({reconnectCount}) => {
      this.messages.push({
        type: 'system',
        message: `socket close, reconnectCount: ${reconnectCount}`
      })
    })
    this.socket.addEventListener('error', () => {
      this.messages.push({
        type: 'system',
        message: `socket error`
      })
    })
    this.socket.addEventListener('message', ({data}) => {
      const decodeData = decode(data)
      if (decodeData) {
        switch (decodeData.type) {
          case 'new message':
          case 'login':
          case 'user joined':
          case 'user left':
            this.messages.push(decodeData)
            this.$nextTick(() => {
              this.$refs.content.scrollTop = this.$refs.content.scrollHeight
            })
            break
        }
      }
    })
  },
  methods: {
    sendMsg() {
      if (this.msg !== '') {
        this.socket.send(`42["new message","${this.msg}"]`)
        this.messages.push({
          type: 'new message',
          data: {
            username: this.name,
            message: this.msg,
          }
        })
        this.$nextTick(() => {
          this.$refs.content.scrollTop = this.$refs.content.scrollHeight
        })
        this.msg = ''
      }
    }
  }
})

