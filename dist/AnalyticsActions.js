'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.STORE_ORIGINAL_RESULTS = exports.STASH_RESULT = exports.RUNNING_QUERY = exports.RECEIVE_RESULTS = exports.SET_INTERVAL = exports.SET_DAYS_AGO = exports.SET_END = exports.SET_START = exports.SET_KEEN_CONFIG = undefined;
exports.setKeenConfig = setKeenConfig;
exports.setKeenStart = setKeenStart;
exports.setKeenEnd = setKeenEnd;
exports.setInterval = setInterval;
exports.stashResult = stashResult;
exports.runQueries = runQueries;
exports.renderResults = renderResults;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SET_KEEN_CONFIG = exports.SET_KEEN_CONFIG = 'SET_KEEN_CONFIG';
var SET_START = exports.SET_START = 'SET_START';
var SET_END = exports.SET_END = 'SET_END';
var SET_DAYS_AGO = exports.SET_DAYS_AGO = 'SET_DAYS_AGO';
var SET_INTERVAL = exports.SET_INTERVAL = 'SET_INTERVAL';
var RECEIVE_RESULTS = exports.RECEIVE_RESULTS = 'RECEIVE_RESULTS';
var RUNNING_QUERY = exports.RUNNING_QUERY = 'RUNNING_QUERY';
var STASH_RESULT = exports.STASH_RESULT = 'STASH_RESULT';
var STORE_ORIGINAL_RESULTS = exports.STORE_ORIGINAL_RESULTS = 'STORE_ORIGINAL_RESULTS';

function setKeenConfig(projectId, readKey) {
  return {
    type: SET_KEEN_CONFIG,
    projectId: projectId,
    readKey: readKey,
    receivedAt: (0, _moment2.default)().format()
  };
}

function setKeenStart(dateTime) {
  return {
    type: SET_START,
    start: (0, _moment2.default)(dateTime),
    receivedAt: (0, _moment2.default)().format()
  };
}
function setKeenEnd(projectId, readKey) {
  return {
    type: SET_END,
    end: (0, _moment2.default)(dateTime),
    receivedAt: (0, _moment2.default)().format()
  };
}
function setInterval(interval) {
  return {
    type: SET_INTERVAL,
    interval: interval,
    receivedAt: (0, _moment2.default)().format()
  };
}
//used to stash a result for use by another query
function stashResult(key, timeframe, results) {
  return {
    type: STASH_RESULT,
    key: key,
    timeframe: timeframe,
    results: results,
    receivedAt: (0, _moment2.default)().format()
  };
}

function runQueries(client, title, queryType, queries, resultsModifier) {
  return function (dispatch) {
    dispatch(runningQuery(title));
    var promises = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = queries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var query = _step.value;

        promises.push(client.query(queryType, query));
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    Promise.all(promises).then(function (res) {
      dispatch(storeOriginalResults(title, res));
      return dispatch(renderResults(title, res, resultsModifier));
    }).catch(function (err) {
      console.error('Error in querying results:', err);
      return err;
    });
  };
}

function renderResults(title, res, resultsModifier) {
  return function (dispatch) {
    var results = res;
    if (resultsModifier) {
      return resultsModifier(res).then(function (modResults) {
        return dispatch(receiveQueryResults(title, modResults));
      }).catch(function (err) {
        console.error('Error in modifying results:', err);
        return err;
      });
    }
    if (res.length === 1) {
      results = res[0];
    }
    return dispatch(receiveQueryResults(title, results));
  };
}

//fSA
function runningQuery(title) {
  return {
    type: RUNNING_QUERY,
    title: title,
    receivedAt: (0, _moment2.default)().format()
  };
}
function storeOriginalResults(title, results) {
  return {
    type: STORE_ORIGINAL_RESULTS,
    title: title,
    results: results,
    receivedAt: (0, _moment2.default)().format()
  };
}
function receiveQueryResults(title, results) {
  return {
    type: RECEIVE_RESULTS,
    title: title,
    results: results,
    receivedAt: (0, _moment2.default)().format()
  };
}