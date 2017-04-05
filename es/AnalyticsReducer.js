'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _AnalyticsActions = require('./AnalyticsActions.js');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var initialState = {
  client: null,
  start: (0, _moment2.default)().subtract(6, 'months').format(),
  interval: 'weekly',
  end: (0, _moment2.default)().endOf('day').format(),
  originalResults: {},
  results: {},
  daysAgo: 365,
  stash: {},
  isLoading: false,
  isLoaded: false,
  lastUpdated: (0, _moment2.default)().startOf('day').format()
};

/*REDUCERS*/
function analyticsReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case _AnalyticsActions.SET_INTERVAL:
      return _extends({}, state, {
        interval: action.interval,
        lastUpdated: action.receivedAt
      });
    case _AnalyticsActions.SET_DAYS_AGO:
      return _extends({}, state, {
        daysAgo: action.daysAgo,
        start: (0, _moment2.default)(state.end).subtract(action.daysAgo).startOf('day').format(),
        lastUpdated: action.receivedAt
      });
    case _AnalyticsActions.SET_START:
      return _extends({}, state, {
        daysAgo: (0, _moment2.default)(state.end).diff((0, _moment2.default)(action.start), 'days'),
        start: action.start,
        lastUpdated: action.receivedAt
      });
    case _AnalyticsActions.SET_END:
      return _extends({}, state, {
        daysAgo: (0, _moment2.default)(state.end).diff((0, _moment2.default)(state.start), 'days'),
        end: action.end,
        lastUpdated: action.receivedAt
      });
    case _AnalyticsActions.SET_START_AND_END:
      {
        var interval = state.interval;
        var durationInDays = (0, _moment2.default)(action.end).diff((0, _moment2.default)(action.start), 'days');
        if (durationInDays <= 1) {
          interval = 'hourly';
        } else if (durationInDays <= 31) {
          interval = 'daily';
        } else if (durationInDays <= 99) {
          interval = 'weekly';
        } else {
          interval = 'monthly';
        }
        return _extends({}, state, {
          daysAgo: (0, _moment2.default)(action.end).diff((0, _moment2.default)(action.start), 'days'),
          interval: interval,
          start: action.start,
          end: action.end,
          lastUpdated: action.receivedAt
        });
      }
    case _AnalyticsActions.SET_KEEN_CONFIG:
      {
        var Keen = require('keen-analysis');
        return _extends({}, state, {
          client: new Keen({
            projectId: action.projectId,
            readKey: action.readKey
          }),
          isLoading: false,
          isLoaded: true,
          lastUpdated: action.receivedAt
        });
      }
    case _AnalyticsActions.RUNNING_QUERY:
      {
        var newResults = Object.assign({}, state.results);
        newResults[action.title] = null;
        return _extends({}, state, {
          results: newResults
        });
      }
    case _AnalyticsActions.STORE_ORIGINAL_RESULTS:
      {
        var _newResults = Object.assign({}, state.originalResults);
        _newResults[action.title] = action.results;
        return _extends({}, state, {
          originalResults: _newResults
        });
      }
    case _AnalyticsActions.RECEIVE_RESULTS:
      {
        var _newResults2 = Object.assign({}, state.results);
        _newResults2[action.title] = action.results;
        return _extends({}, state, {
          results: _newResults2
        });
      }
    case _AnalyticsActions.STASH_RESULT:
      {
        var newStash = Object.assign({}, state.stash);
        newStash[action.key + '_' + action.timeframe] = action.results;
        return _extends({}, state, {
          stash: newStash
        });
      }
    default:
      return state;
  }
}

exports.default = analyticsReducer;