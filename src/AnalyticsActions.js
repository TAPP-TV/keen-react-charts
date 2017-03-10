import moment from 'moment';

export const SET_KEEN_CONFIG = 'SET_KEEN_CONFIG';
export const SET_START = 'SET_START';
export const SET_END = 'SET_END';
export const SET_DAYS_AGO = 'SET_DAYS_AGO';
export const SET_INTERVAL = 'SET_INTERVAL';
export const RECEIVE_RESULTS = 'RECEIVE_RESULTS';
export const RUNNING_QUERY = 'RUNNING_QUERY';
export const STASH_RESULT = 'STASH_RESULT';
export const STORE_ORIGINAL_RESULTS = 'STORE_ORIGINAL_RESULTS';

export function setKeenConfig(projectId, readKey) {
    return {
        type: SET_KEEN_CONFIG,
        projectId: projectId,
        readKey: readKey,
        receivedAt: moment().format()
    }
}

//used to stash a result for use by another query
export function stashResult(key, timeframe, results) {
    return {
        type: STASH_RESULT,
        key: key,
        timeframe: timeframe,
        results: results,
        receivedAt: moment().format()
    }
}

export function runQueries(client, title, queryType, queries, resultsModifier) {
    return dispatch => {
        dispatch(runningQuery(title));
        const promises = [];
        for (const query of queries) {
            promises.push(client.query(queryType, query))
        }
        Promise.all(promises)
            .then((res) => {
                dispatch(storeOriginalResults(title, res));
                return dispatch(renderResults(title, res, resultsModifier));
            })
            .catch((err) => {
                console.error('Error in querying results:', err);
                return err;
            })
    }
}


export function renderResults(title, res, resultsModifier) {
    return dispatch => {
        let results = res;
        if (resultsModifier) {
            return resultsModifier(res)
                .then((modResults) => {
                    return dispatch(receiveQueryResults(title, modResults))
                })
                .catch((err) => {
                    console.error('Error in modifying results:', err);
                    return err;
                })
        }
        if (res.length === 1) {
            results = res[0];
        }
        return dispatch(receiveQueryResults(title, results));
    }
}



//fSA
function runningQuery(title) {
    return {
        type: RUNNING_QUERY,
        title: title,
        receivedAt: moment().format()
    }
}
function storeOriginalResults(title, results) {
    return {
        type: STORE_ORIGINAL_RESULTS,
        title: title,
        results: results,
        receivedAt: moment().format()
    }
}
function receiveQueryResults(title, results) {
    return {
        type: RECEIVE_RESULTS,
        title: title,
        results: results,
        receivedAt: moment().format()
    }
}
