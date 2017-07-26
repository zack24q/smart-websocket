/**
* smart-websocket v1.0.0
* https://github.com/zack24q/smart-websocket
* Released under the MIT License.
*/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.SmartWebsocket = factory());
}(this, (function () { 'use strict';

function createEvent(type, args) {
  var event = new CustomEvent(type);
  Object.assign(event, args);
  return event
}

var SmartWebsocket = function SmartWebsocket(url, ref) {
  var this$1 = this;
  if ( ref === void 0 ) ref = {};
  var autoOpen = ref.autoOpen; if ( autoOpen === void 0 ) autoOpen = true;
  var smartSend = ref.smartSend; if ( smartSend === void 0 ) smartSend = true;
  var autoReconnect = ref.autoReconnect; if ( autoReconnect === void 0 ) autoReconnect = true;
  var reconnectDelay = ref.reconnectDelay; if ( reconnectDelay === void 0 ) reconnectDelay = 500;
  var maxReconnectCount = ref.maxReconnectCount; if ( maxReconnectCount === void 0 ) maxReconnectCount = 3;

  this._url = url;
  this._autoOpen = autoOpen;
  this._smartSend = smartSend;
  this._autoReconnect = autoReconnect;
  this._reconnectDelay = reconnectDelay;
  this._maxReconnectCount = maxReconnectCount;

  this._reconnectCount = 0;
  this._forceClose = false;
  this._bus = document.createElement('div');

  this.socket = null;
  this.addEventListener = this._bus.addEventListener.bind(this._bus);
  this.removeEventListener = this._bus.removeEventListener.bind(this._bus);

  var reconnectHandler = function () {
    if (!this$1._forceClose) { // user don`t call close function
      this$1._reconnectCount += 1;
      if (this$1._reconnectCount > this$1._maxReconnectCount) { // reconnect count reached the maximum
        this$1._bus.dispatchEvent(createEvent('reconnectStopped', {reconnectCount: this$1._reconnectCount}));
        this$1._reconnectCount = 0;
      } else {
        setTimeout(function () {
          this$1.open();
        }, this$1._reconnectDelay);
      }
    } else { // user call close function
      this$1._forceClose = false;
      this$1._reconnectCount = 0;
    }
  };

  this._autoReconnect && this.addEventListener('close', reconnectHandler);
  this._autoOpen && this.open();
};

SmartWebsocket.prototype.open = function open () {
    var this$1 = this;

  if (this.socket && this.socket.readyState === 1) { // socket is opened
    return
  }
  this.socket = new WebSocket(this._url);
  this._bus.dispatchEvent(createEvent('connecting', {reconnectCount: this._reconnectCount}));

  this.socket.addEventListener('open', function () {
    this$1._bus.dispatchEvent(createEvent('open', {reconnectCount: this$1._reconnectCount}));
    this$1._reconnectCount = 0;
  });
  this.socket.addEventListener('message', function (ref) {
      var data = ref.data;
      var origin = ref.origin;
      var lastEventId = ref.lastEventId;
      var source = ref.source;
      var ports = ref.ports;

    this$1._bus.dispatchEvent(createEvent('message', {reconnectCount: this$1._reconnectCount, data: data, origin: origin, lastEventId: lastEventId, source: source, ports: ports}));
  });
  this.socket.addEventListener('close', function (ref) {
      var code = ref.code;
      var reason = ref.reason;
      var wasClean = ref.wasClean;

    this$1._bus.dispatchEvent(createEvent('close', {reconnectCount: this$1._reconnectCount, code: code, reason: reason, wasClean: wasClean}));
  });
  this.socket.addEventListener('error', function () {
    this$1._bus.dispatchEvent(createEvent('error', {reconnectCount: this$1._reconnectCount}));
  });
};

SmartWebsocket.prototype.close = function close () {
  if (this.socket) {
    this._forceClose = true;
    this.socket.close();
  }
};

SmartWebsocket.prototype.send = function send (data) {
    var this$1 = this;

  if (!this.socket || (this.socket.readyState === 0 && this._smartSend)) {
    this.addEventListener('open', function () {
      this$1.socket.send(data);
    }, {once: true});
  } else {
    this.socket.send(data);
  }
};

return SmartWebsocket;

})));
