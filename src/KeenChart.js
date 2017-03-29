// @flow
import React, {PureComponent} from 'react';
import Dataviz from 'keen-dataviz';
import moment from 'moment';
import {runQueries, renderResults} from './AnalyticsActions';

class KeenChart extends PureComponent {
  constructor() {
    super();
    this.state = {
      chart: null
    };
    this.getQueries = this.getQueries.bind(this);
    this.getChart = this.getChart.bind(this);
    this.getTimeSeriesOptions = this.getTimeSeriesOptions.bind(this);
    this.renderGraph = this.renderGraph.bind(this);
    this.setupChart = this.setupChart.bind(this);
  }
  componentDidMount() {
    this.setupChart();
  }

  setupChart() {
    //if using normal chart, set it up and send queries
    if (!this.props.altRenderer) {
      this.setState(
        {
          chart: this.getChart()
        },
        () => {
          this.state.chart.prepare();
          if (this.props.client) {
            this.renderGraph();
          }
        }
      );
    } else {
      if (this.props.client) {
        this.renderGraph();
      }
    }
  }

  componentWillReceiveProps(newProps) {
    //send queries if just got client, and haven't created chart yet
    if (!this.props.client && newProps.client && !this.state.chart) {
      this.renderGraph();
    }
    if (
      newProps.results[this.props.title] &&
      this.props.results[this.props.title] !==
        newProps.results[this.props.title]
    ) {
      console.log(
        'RENDER ',
        this.props.title,
        newProps.results[this.props.title]
      );
      if (this.props.onResults) this.props.onResults();
      if (newProps.altRenderer) {
        newProps.altRenderer(newProps.results[this.props.title]);
      } else {
        this.state.chart.data(newProps.results[this.props.title]);
        this.state.chart.view.stacked = typeof newProps.chartOptions.isStacked !==
          'undefined'
          ? newProps.chartOptions.isStacked
          : true;
        this.state.chart.render();
      }
    } else if (this.props.variables !== newProps.variables) {
      this.reRenderGraph();
      //console.log(this.props.variables, newProps.variables);
    }
  }
  componentDidUpdate(oldProps) {
    if (
      this.props.start !== oldProps.start ||
      this.props.end !== oldProps.end ||
      this.props.interval !== oldProps.interval
    ) {
      this.renderGraph();
    }
    if (this.props.title !== oldProps.title) {
      this.setupChart();
    }
  }

  reRenderGraph() {
    const results = this.props.originalResults[this.props.title];
    this.props.dispatch(
      renderResults(this.props.title, results, this.props.resultsModifier)
    );
  }

  renderGraph() {
    if (this.props.onQuery) this.props.onQuery();
    const queries = this.getQueries();
    this.props.dispatch(
      runQueries(
        this.props.client,
        this.props.title,
        this.props.queryType,
        queries,
        this.props.resultsModifier
      )
    );
  }
  //set values for timeseries display
  getTimeSeriesOptions(isSparkline = false) {
    var format = '%b-%d-%y';
    var interval = this.props.interval;
    if (interval == 'hourly' || interval == 'every_15_minutes') {
      format = '%m/%d %H:%M';
    } else if (interval == 'monthly') {
      format = '%b %Y';
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
          lines: [{value: 0, text: '0'}]
        }
      },
      axis: {
        x: {
          tick: {
            culling: {
              max: 8 // the number of tick texts will be adjusted to less than this value
            },
            type: 'timeseries',
            format: function(d) {
              if (interval == 'monthly') {
                d = moment(d).add('days', 1).format();
              }
              return d3.time.format(format)(new Date(d));
            }
          }
        }
      }
    };
  }

  getChart() {
    const self = this;
    let options = {
      'border-radius': '5px',
      minimumSlicePercentage: 5,
      donut: {
        label: {
          format: function(value, ratio) {
            return `${Math.floor(ratio * 100)}%`;
          }
        }
      },
      gauge: {
        label: {
          format: function(value, ratio) {
            return value;
          }
        }
      },
      transition: {
        duration: 0
      },
      tooltip: {
        format: {
          value: function(value, ratio) {
            return value;
          }
        }
      },
      legend: 'bottom'
    };
    const height = this.props.chartOptions && this.props.chartOptions.height
      ? this.props.chartOptions.height
      : 400;
    if (this.props.interval) {
      options = Object.assign(options, this.getTimeSeriesOptions());
    }
    return new Dataviz()
      .el(self.refs.theKeenChart)
      .colors(this.props.colors)
      .height(height)
      .title(self.props.title)
      .type(self.props.chartType)
      .chartOptions(Object.assign(options, this.props.chartOptions));
  }

  getQueries() {
    const baseQuery = {
      max_age: 300,
      timeframe: {
        start: this.props.start,
        end: this.props.end
      },
      refresh_rate: 3600,
      interval: this.props.interval
    };
    const queries = this.props.query instanceof Array
      ? this.props.query
      : [this.props.query];
    const newQueries = [];
    for (const query of queries) {
      const combinedQuery = {
        ...baseQuery,
        ...query
      };
      newQueries.push(combinedQuery);
    }
    return newQueries;
  }

  render() {
    return <div className="keen-react-chart" ref="theKeenChart" />;
  }
}

KeenChart.propTypes = {
  title: React.PropTypes.string.isRequired,
  query: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.array
  ]),
  altRenderer: React.PropTypes.func,
  onQuery: React.PropTypes.func,
  results: React.PropTypes.object.isRequired,
  resultsModifier: React.PropTypes.func,
  chartType: React.PropTypes.string.isRequired,
  queryType: React.PropTypes.string.isRequired,
  client: React.PropTypes.object,
  chartOptions: React.PropTypes.object,
  start: React.PropTypes.string.isRequired,
  end: React.PropTypes.string.isRequired,
  dispatch: React.PropTypes.func.isRequired,
  interval: React.PropTypes.string
};

export default KeenChart;
