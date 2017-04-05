import moment from 'moment';

export const SET_KEEN_CONFIG = 'KEENCHART_SET_KEEN_CONFIG';
export const SET_START = 'KEENCHART_SET_START';
export const SET_END = 'KEENCHART_SET_END';
export const SET_START_AND_END = 'KEENCHART_SET_START_AND_END';
export const SET_DAYS_AGO = 'KEENCHART_SET_DAYS_AGO';
export const SET_INTERVAL = 'KEENCHART_SET_INTERVAL';
export const RECEIVE_RESULTS = 'KEENCHART_RECEIVE_RESULTS';
export const RUNNING_QUERY = 'KEENCHART_RUNNING_QUERY';
export const STASH_RESULT = 'KEENCHART_STASH_RESULT';
export const STORE_ORIGINAL_RESULTS = 'KEENCHART_STORE_ORIGINAL_RESULTS';

export function setKeenConfig(projectId, readKey) {
  return {
    type: SET_KEEN_CONFIG,
    projectId: projectId,
    readKey: readKey,
    receivedAt: moment().format()
  };
}

export function setKeenStart(dateTime) {
  return {
    type: SET_START,
    start: moment(dateTime).format(),
    receivedAt: moment().format()
  };
}
export function setKeenEnd(dateTime) {
  return {
    type: SET_END,
    end: moment(dateTime).format(),
    receivedAt: moment().format()
  };
}
export function setKeenStartAndEnd(startDateTime, endDateTime) {
  return {
    type: SET_START_AND_END,
    start: moment(startDateTime).format(),
    end: moment(endDateTime).format(),
    receivedAt: moment().format()
  };
}
export function setInterval(interval) {
  return {
    type: SET_INTERVAL,
    interval: interval,
    receivedAt: moment().format()
  };
}

export function runQueries(client, title, queryType, queries, resultsModifier) {
  return dispatch => {
    dispatch(runningQuery(title));
    const promises = [];
    for (const query of queries) {
      promises.push(client.query(queryType, query));
    }
    let result = null;
    Promise.all(promises)
      .then(res => {
        result = res;
        return dispatch(storeOriginalResults(title, res));
      })
      .then(() => {
        dispatch(renderResults(title, result, resultsModifier));
      })
      .catch(err => {
        console.error('Error in querying results:', err);
        throw err;
      });
  };
}

export function renderResults(title, res, resultsModifier) {
  return dispatch => {
    let results = res;
    if (resultsModifier) {
      return resultsModifier(res)
        .then(modResults => {
          return dispatch(receiveQueryResults(title, modResults));
        })
        .catch(err => {
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
    receivedAt: moment().format()
  };
}
function storeOriginalResults(title, results) {
  return {
    type: STORE_ORIGINAL_RESULTS,
    title: title,
    results: results,
    receivedAt: moment().format()
  };
}
function receiveQueryResults(title, results) {
  return {
    type: RECEIVE_RESULTS,
    title: title,
    results: results,
    receivedAt: moment().format()
  };
}
