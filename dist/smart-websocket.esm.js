/**
* smart-websocket v1.0.1
* https://github.com/zack24q/smart-websocket
* Released under the MIT License.
*/

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function createEvent(type, args) {
  var event = new CustomEvent(type);
  _extends(event, args);
  return event;
}

var SmartWebsocket = function () {
  function SmartWebsocket(url) {
    var _this = this;

    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$autoOpen = _ref.autoOpen,
        autoOpen = _ref$autoOpen === undefined ? true : _ref$autoOpen,
        _ref$smartSend = _ref.smartSend,
        smartSend = _ref$smartSend === undefined ? true : _ref$smartSend,
        _ref$autoReconnect = _ref.autoReconnect,
        autoReconnect = _ref$autoReconnect === undefined ? true : _ref$autoReconnect,
        _ref$reconnectDelay = _ref.reconnectDelay,
        reconnectDelay = _ref$reconnectDelay === undefined ? 500 : _ref$reconnectDelay,
        _ref$maxReconnectCoun = _ref.maxReconnectCount,
        maxReconnectCount = _ref$maxReconnectCoun === undefined ? 3 : _ref$maxReconnectCoun;

    _classCallCheck(this, SmartWebsocket);

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

    var reconnectHandler = function reconnectHandler() {
      if (!_this._forceClose) {
        _this._reconnectCount += 1;
        if (_this._reconnectCount > _this._maxReconnectCount) {
          _this._bus.dispatchEvent(createEvent('reconnectStopped', { reconnectCount: _this._reconnectCount }));
          _this._reconnectCount = 0;
        } else {
          setTimeout(function () {
            _this.open();
          }, _this._reconnectDelay);
        }
      } else {
        _this._forceClose = false;
        _this._reconnectCount = 0;
      }
    };

    this._autoReconnect && this.addEventListener('close', reconnectHandler);
    this._autoOpen && this.open();
  }

  _createClass(SmartWebsocket, [{
    key: 'open',
    value: function open() {
      var _this2 = this;

      if (this.socket && this.socket.readyState === 1) {
        return;
      }
      this.socket = new WebSocket(this._url);
      this._bus.dispatchEvent(createEvent('connecting', { reconnectCount: this._reconnectCount }));

      this.socket.addEventListener('open', function () {
        _this2._bus.dispatchEvent(createEvent('open', { reconnectCount: _this2._reconnectCount }));
        _this2._reconnectCount = 0;
      });
      this.socket.addEventListener('message', function (_ref2) {
        var data = _ref2.data,
            origin = _ref2.origin,
            lastEventId = _ref2.lastEventId,
            source = _ref2.source,
            ports = _ref2.ports;

        _this2._bus.dispatchEvent(createEvent('message', { reconnectCount: _this2._reconnectCount, data: data, origin: origin, lastEventId: lastEventId, source: source, ports: ports }));
      });
      this.socket.addEventListener('close', function (_ref3) {
        var code = _ref3.code,
            reason = _ref3.reason,
            wasClean = _ref3.wasClean;

        _this2._bus.dispatchEvent(createEvent('close', { reconnectCount: _this2._reconnectCount, code: code, reason: reason, wasClean: wasClean }));
      });
      this.socket.addEventListener('error', function () {
        _this2._bus.dispatchEvent(createEvent('error', { reconnectCount: _this2._reconnectCount }));
      });
    }
  }, {
    key: 'close',
    value: function close() {
      if (this.socket) {
        this._forceClose = true;
        this.socket.close();
      }
    }
  }, {
    key: 'send',
    value: function send(data) {
      var _this3 = this;

      if (!this.socket || this.socket.readyState === 0 && this._smartSend) {
        this.addEventListener('open', function () {
          _this3.socket.send(data);
        }, { once: true });
      } else {
        this.socket.send(data);
      }
    }
  }]);

  return SmartWebsocket;
}();

export default SmartWebsocket;
