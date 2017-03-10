import {
  STORE_ORIGINAL_RESULTS,
  RUNNING_QUERY,
  STASH_RESULT,
  RECEIVE_RESULTS,
  SET_START,
  SET_END,
  SET_DAYS_AGO,
  SET_INTERVAL,
  SET_KEEN_CONFIG
} from './AnalyticsActions.js';
import Keen from 'keen-analysis';
import moment from 'moment';

const initialState = {
  client: null,
  start: moment().subtract(6, 'months').format(),
  interval: 'weekly',
  end: moment().endOf('day').format(),
  originalResults: {},
  results: {},
  daysAgo: 365,
  stash: {},
  isLoading: false,
  isLoaded: false,
  lastUpdated: moment().startOf('day').format()
};
/*REDUCERS*/
function analyticsReducer(state = initialState, action) {
  switch (action.type) {
    case SET_INTERVAL:
      return {
        ...state,
        interval: action.interval,
        lastUpdated: action.receivedAt
      };
    case SET_DAYS_AGO:
      return {
        ...state,
        daysAgo: action.daysAgo,
        start: moment(state.end)
          .subtract(action.daysAgo)
          .startOf('day')
          .format(),
        lastUpdated: action.receivedAt
      };
    case SET_START:
      return {
        ...state,
        daysAgo: moment(state.end).diff(moment(action.start), 'days'),
        start: action.start,
        lastUpdated: action.receivedAt
      };
    case SET_END:
      return {
        ...state,
        daysAgo: moment(state.end).diff(moment(state.start), 'days'),
        end: action.end,
        lastUpdated: action.receivedAt
      };
    case SET_KEEN_CONFIG:
      return {
        ...state,
        client: new Keen({
          projectId: action.projectId,
          readKey: action.readKey
        }),
        isLoading: false,
        isLoaded: true,
        lastUpdated: action.receivedAt
      };
    case RUNNING_QUERY: {
      const newResults = Object.assign({}, state.results);
      newResults[action.title] = null;
      return {
        ...state,
        results: newResults
      };
    }
    case STORE_ORIGINAL_RESULTS: {
      const newResults = Object.assign({}, state.originalResults);
      newResults[action.title] = action.results;
      return {
        ...state,
        originalResults: newResults
      };
    }
    case RECEIVE_RESULTS: {
      const newResults = Object.assign({}, state.results);
      newResults[action.title] = action.results;
      return {
        ...state,
        results: newResults
      };
    }
    case STASH_RESULT: {
      const newStash = Object.assign({}, state.stash);
      newStash[`${action.key}_${action.timeframe}`] = action.results;
      return {
        ...state,
        stash: newStash
      };
    }
    default:
      return state;
  }
}

export default analyticsReducer;
