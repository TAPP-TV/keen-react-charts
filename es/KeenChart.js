'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _keenDataviz = require('keen-dataviz');

var _keenDataviz2 = _interopRequireDefault(_keenDataviz);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

var _AnalyticsActions = require('./AnalyticsActions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var KeenChart = function (_PureComponent) {
  _inherits(KeenChart, _PureComponent);

  function KeenChart() {
    _classCallCheck(this, KeenChart);

    var _this = _possibleConstructorReturn(this, (KeenChart.__proto__ || Object.getPrototypeOf(KeenChart)).call(this));

    _this.state = {
      chart: null
    };
    _this.getQueries = _this.getQueries.bind(_this);
    _this.getChart = _this.getChart.bind(_this);
    _this.getTimeSeriesOptions = _this.getTimeSeriesOptions.bind(_this);
    _this.renderGraph = _this.renderGraph.bind(_this);
    _this.setupChart = _this.setupChart.bind(_this);
    return _this;
  }

  _createClass(KeenChart, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.setupChart();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      //send queries if just got client, and haven't created chart yet
      if (!this.props.client && newProps.client && !this.state.chart) {
        this.renderGraph();
      }
      if (newProps.results[this.props.title] && this.props.results[this.props.title] !== newProps.results[this.props.title]) {
        console.log('RENDER ', this.props.title, newProps.results[this.props.title]);
        if (this.props.onResults) this.props.onResults();
        if (newProps.altRenderer) {
          newProps.altRenderer(newProps.results[this.props.title]);
        } else if (this.state.chart) {
          this.state.chart.data(newProps.results[this.props.title]);
          var stacked = typeof newProps.chartOptions.isStacked !== 'undefined' ? newProps.chartOptions.isStacked : true;
          var newChart = Object.assign({}, this.state.chart);
          newChart.view.stacked = stacked;
          this.setState({ chart: newChart }, function () {
            newChart.render();
          });
        }
      } else if (this.props.variables !== newProps.variables) {
        this.reRenderGraph();
        //console.log(this.props.variables, newProps.variables);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(oldProps) {
      if (this.props.start !== oldProps.start || this.props.end !== oldProps.end || this.props.interval !== oldProps.interval) {
        this.renderGraph();
      }
      if (this.props.title !== oldProps.title) {
        this.setupChart();
      }
    }
  }, {
    key: 'setupChart',
    value: function setupChart() {
      var _this2 = this;

      //if using normal chart, set it up and send queries
      if (!this.props.altRenderer) {
        this.setState({
          chart: this.getChart()
        }, function () {
          _this2.state.chart.prepare();
          if (_this2.props.client) {
            _this2.renderGraph();
          }
        });
      } else {
        if (this.props.client) {
          this.renderGraph();
        }
      }
    }
  }, {
    key: 'reRenderGraph',
    value: function reRenderGraph() {
      var results = this.props.originalResults[this.props.title];
      this.props.dispatch((0, _AnalyticsActions.renderResults)(this.props.title, results, this.props.resultsModifier));
    }
  }, {
    key: 'renderGraph',
    value: function renderGraph() {
      if (this.props.onQuery) this.props.onQuery();
      var queries = this.getQueries();
      return this.props.dispatch((0, _AnalyticsActions.runQueries)(this.props.client, this.props.title, this.props.queryType, queries, this.props.resultsModifier));
    }
    //set values for timeseries display

  }, {
    key: 'getTimeSeriesOptions',
    value: function getTimeSeriesOptions() {
      var isSparkline = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var _format = '%b-%d-%y';
      var interval = this.props.interval;
      if (interval == 'hourly' || interval == 'every_15_minutes') {
        _format = '%m/%d %H:%M';
      } else if (interval == 'monthly') {
        _format = '%b %Y';
      }
      //make it unlabeled
      if (isSparkline) {
        return {
          axis: {
            y: {
              show: false
            },
            x: {
              show: false
            }
          },
          legend: {
            show: false
          }
        };
      }
      return {
        grid: {
          y: {
            lines: [{ value: 0, text: '0' }]
          }
        },
        axis: {
          x: {
            tick: {
              culling: {
                max: 8 // the number of tick texts will be adjusted to less than this value
              },
              type: 'timeseries',
              format: function format(d) {
                var date = d;
                if (interval == 'monthly') {
                  date = (0, _moment2.default)(d).add('days', 1).format();
                }
                return _d2.default.time.format(_format)(new Date(date));
              }
            }
          }
        }
      };
    }
  }, {
    key: 'getChart',
    value: function getChart() {
      var self = this;
      var options = {
        'border-radius': '5px',
        minimumSlicePercentage: 5,
        donut: {
          label: {
            format: function format(value, ratio) {
              return Math.floor(ratio * 100) + '%';
            }
          }
        },
        grid: {},
        axis: {},
        gauge: {
          label: {
            format: function format(value) {
              return value;
            }
          }
        },
        transition: {
          duration: 0
        },
        tooltip: {
          format: {
            value: function value(_value) {
              return _value;
            }
          }
        },
        legend: { position: 'bottom' }
      };
      var height = this.props.chartOptions && this.props.chartOptions.height ? this.props.chartOptions.height : 400;
      if (this.props.interval) {
        options = Object.assign(options, this.getTimeSeriesOptions());
      }
      var chart = new _keenDataviz2.default().el(self.refs.theKeenChart).colors(this.props.colors).height(height).title(self.props.title).type(self.props.chartType).chartOptions(Object.assign(options, this.props.chartOptions));
      //unsure why we do this twice.
      //I think its to set colors AFTER they've been set by chartOptions?
      if (this.props.colors) chart.colors(this.props.colors);
      return chart;
    }
  }, {
    key: 'getQueries',
    value: function getQueries() {
      var baseQuery = {
        max_age: 300,
        timeframe: {
          start: this.props.start,
          end: this.props.end
        },
        refresh_rate: 3600,
        interval: this.props.interval
      };
      var queries = this.props.query instanceof Array ? this.props.query : [this.props.query];
      var newQueries = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = queries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var query = _step.value;

          var combinedQuery = _extends({}, baseQuery, query);
          newQueries.push(combinedQuery);
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

      return newQueries;
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement('div', { className: 'keen-react-chart', ref: 'theKeenChart' });
    }
  }]);

  return KeenChart;
}(_react.PureComponent);

KeenChart.propTypes = {
  title: _react2.default.PropTypes.string.isRequired,
  query: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.object, _react2.default.PropTypes.array]),
  altRenderer: _react2.default.PropTypes.func,
  onQuery: _react2.default.PropTypes.func,
  originalResults: _react2.default.PropTypes.object,
  results: _react2.default.PropTypes.object.isRequired,
  resultsModifier: _react2.default.PropTypes.func,
  onResults: _react2.default.PropTypes.func,
  chartType: _react2.default.PropTypes.string.isRequired,
  queryType: _react2.default.PropTypes.string.isRequired,
  variables: _react2.default.PropTypes.object,
  colors: _react2.default.PropTypes.array,
  client: _react2.default.PropTypes.object,
  chartOptions: _react2.default.PropTypes.object,
  start: _react2.default.PropTypes.string.isRequired,
  end: _react2.default.PropTypes.string.isRequired,
  dispatch: _react2.default.PropTypes.func.isRequired,
  interval: _react2.default.PropTypes.string
};

exports.default = KeenChart;