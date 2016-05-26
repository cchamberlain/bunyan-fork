'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BunyanFork = exports.subscribeFork = undefined;

var _events = require('events');

var _chai = require('chai');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LEVEL_MAP = { 10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal'
};

var subscribeFork = exports.subscribeFork = function subscribeFork(child, logger) {
  var log = logger.child({ fork_pid: child.pid });
  child.on('message', function (x) {
    if (x.type === 'bunyan') {
      var record = x.record;
      var name = record.name;
      var hostname = record.hostname;
      var pid = record.pid;
      var level = record.level;
      var msg = record.msg;
      var time = record.time;
      var v = record.v;
      var err = record.err;

      _chai.assert.ok(level, 'level is required for bunyan propagation');
      _chai.assert.ok(payload, 'payload is required for bunyan propagation');
      var levelName = LEVEL_MAP(level);
      log[levelName]({ msg: msg, err: err });
    }
  });
};

/**
 * defaultTransformer takes arguments from a bunyan WritableStream's write method and formats output in a standard way that can be interpreted by parent process.
 * @param  {...Object} args - args that were passed to WritableStream.prototype.write()
 * @return {Object}           Object to pass through IPC communication channel to parent process.
 */
function defaultTransformer() {
  try {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var record = args[0];
    var rest = args.slice(1);

    try {
      record = typeof record === 'string' ? JSON.parse(record) : record;
    } catch (err) {
      return { type: 'bunyan', record: { err: new Error('Could not parse message.') } };
    }
    return { type: 'bunyan', record: record };
  } catch (err) {
    return { type: 'bunyan', record: { err: new Error('Internal error occurred.') } };
  }
}

/**
 * Bunyan writable stream that allows a forked process to publish logs to a logger in its parent process.
 */

var BunyanFork = exports.BunyanFork = function (_EventEmitter) {
  _inherits(BunyanFork, _EventEmitter);

  function BunyanFork() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref$transformer = _ref.transformer;
    var transformer = _ref$transformer === undefined ? defaultTransformer : _ref$transformer;

    _classCallCheck(this, BunyanFork);

    _chai.assert.ok(transformer);
    _chai.assert.typeOf(transformer, 'function');

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BunyanFork).call(this));

    _this.write = function () {
      try {
        process.send(_this.transformer.apply(_this, arguments));
      } catch (err) {
        _this.error(err);
        return false;
      }
      return true;
    };

    _this.error = function (err) {
      _this.emit('error', err);
    };

    _this.end = function () {
      if (arguments.length > 0) _this.write.apply(_this, arguments);
      _this.writable = false;
    };

    _this.destroy = function () {
      _this.writable = false;
      _this.emit('close');
    };

    _this.destroySoon = function () {
      _this.destroy();
    };

    _this.transformer = transformer;
    return _this;
  }

  return BunyanFork;
}(_events.EventEmitter);