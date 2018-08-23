/**
  *   HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
  *
  *   (c) 2016-2018 Hortonworks, Inc. All rights reserved.
  *
  *   This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms of the
  *   Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party authorized
  *   to distribute this code.  If you do not have a written agreement with Hortonworks or with an authorized and
  *   properly licensed third party, you do not have any rights to this code.
  *
  *   If this code is provided to you under the terms of the AGPLv3:
  *   (A) HORTONWORKS PROVIDES THIS CODE TO YOU WITHOUT WARRANTIES OF ANY KIND;
  *   (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH RESPECT TO THIS CODE, INCLUDING BUT NOT
  *     LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE;
  *   (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY, OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING
  *     FROM OR RELATED TO THE CODE; AND
  *   (D) WITH RESPECT TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY
  *     DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
  *     DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
  *     OR LOSS OR CORRUPTION OF DATA.
**/


import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {C_Producers,C_Consumers} from '../CommonComponent/ProducerConsumerList';
import app_state from '../../app_state';
import TimeSeriesChart from '../Graph/TimeSeriesChart';
import moment from 'moment';
import {ProgressBarPanel, TopicDetails2}  from '../CommonComponent/Panel.js';
import MetricNotification from '../CommonComponent/MetricNotification';
import TopicREST from '../../rest/TopicREST';
import Utils from '../../utils/Utils';

export default class TopicMetricsDetails extends Component{
  constructor(props){
    super(props);
    this.state = {
      loading: false,
      loadingRecord: false,
      showMetrics : true,
      graphHeight: 65
    };
  }

  componentDidMount(){
    // this.fetchTopic();
  }


  getGraph(name, data, interpolation) {
    const self = this;
    const startDate = data[0] ? data[0].date : this.props.startDate.toDate();
    const endDate = data[data.length-1] ? data[data.length-1].date : this.props.endDate.toDate();
    return <TimeSeriesChart color={d3.scale.category20c().range(['#44abc0', '#8b4ea6'])} ref={name} data={data} interpolation={interpolation} height={this.state.graphHeight} setXDomain={function() {
      this.x.domain([startDate, endDate]);
    }}    setYDomain={function() {
      const min = d3.min(this.mapedData, (c) => {
        return d3.min(c.values, (v) => {
          return v.value;
        });
      });
      const buffer = min/10;
      this.y.domain([
        min-buffer,
        d3.max(this.mapedData, (c) => {
          return d3.max(c.values, (v) => {
            return v.value;
          });
        })+buffer
      ]);
    }} getXAxis={function(){
      return d3.svg.axis().orient("bottom").tickFormat("");
    }} getYAxis={function() {
      return d3.svg.axis().orient("left").tickFormat("");
    }} showTooltip={function(d) {
      TimeSeriesChart.defaultProps.showTooltip.call(this, d);
    }} hideTooltip={function() {
      TimeSeriesChart.defaultProps.hideTooltip.call(this);
    }} onBrushEnd={function() {
      if (!this.brush.empty()) {
        const newChartXRange = this.brush.extent();
        self.props.datePickerHandler(moment(newChartXRange[0]), moment(newChartXRange[1]));
      }
    }} drawBrush={()=>{}}/>;
  }

  render(){
    const {consumers, selectedTopic, producers} = this.props;
    const {timeSeriesMetrics} = this.state;
    const messageInData = [];
    const messageOutData = [];
    const totalMessageData = [];
    const bytesInData = [];
    const bytesOutData = [];
    const totalBytesData = [];
    const failedFetchData = [];
    const failedProduceData = [];

    const metrics = selectedTopic && selectedTopic.metrics ? selectedTopic.metrics : {bytesInCount:{}};
    const {
      bytesInCount,
      bytesOutCount,
      messagesInCount
    } = metrics;
    const keys = _.keys(bytesInCount).sort((a,b) => {return a - b;});
    _.each(keys, (key) => {
      bytesInData.push({
        date: new Date(parseInt(key)),
        Input: bytesInCount[key] || 0
      });
      bytesOutData.push({
        date: new Date(parseInt(key)),
        Output: bytesOutCount[key] || 0
      });
      messageInData.push({
        date: new Date(parseInt(key)),
        Input: messagesInCount[key] || 0
      });
    });

    const loader = <img src="styles/img/start-loader.gif" alt="loading" style={{width: "50px",marginTop: "0px"}}/>;
    const topicSummary = selectedTopic.topicSummary;
    return(
      <div>
        <div className="row-margin-bottom clearfix background-adjust">
          {/*metric-body is just for background color overlay*/}
          <div className=" metric-body">
            <div className="metric-background">
            </div>
          </div>
          {selectedTopic != null ? <TopicDetails2 data={{producers,consumers,...selectedTopic}} viewType="Profile"/> : null}
        </div>
        <div className="row">
          <div className="col-sm-12">
            <div className="col-sm-3 summary-container">
              <h4>Summary</h4>
              <ul className="summary-list">
                <li>Number of Replicas <span>{topicSummary.numOfReplicas}</span></li>
                <li>Number of Partitions <span>{topicSummary.numOfPartitions}</span></li>
                <li>Total number of Brokers for Topic<span>{topicSummary.numOfBrokersForTopic}</span></li>
                <li>Preferred Replication % <span>{topicSummary.preferredReplicasPercent}</span></li>
                <li>Under Replicated % <span>{topicSummary.underReplicatedPercent}</span></li>
              </ul>
            </div>
            <div className="col-sm-9">
              <div className="row  row-margin-bottom">
                <div className="col-md-4">
                  <div className="topology-foot-graphs">
                    <div className="metric-graph-title">Bytes In Count<span className="pull-right">{Utils.getHighestTimestampValue(bytesInCount).toFixed(0)}</span></div>
                    <div style={{
                      height: '65px',
                      textAlign: 'center'
                    }}>
                      {this.state.loadingRecord ? loader : this.getGraph('bytesInCount', bytesInData, 'step-before')}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="topology-foot-graphs">
                    <div className="metric-graph-title">Bytes Out Count <span className="pull-right">{Utils.getHighestTimestampValue(bytesOutCount).toFixed(0)}</span></div>
                    <div style={{
                      height: '65px',
                      textAlign: 'center'
                    }}>
                      {this.state.loadingRecord ? loader : this.getGraph('bytesOutCount', bytesOutData, 'step-before')}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="topology-foot-graphs">
                    <div className="metric-graph-title">Messages In Count <span className="pull-right">{Utils.getHighestTimestampValue(messagesInCount).toFixed(0)}</span></div>
                    <div style={{
                      height: '65px',
                      textAlign: 'center'
                    }}>
                      {this.state.loadingRecord ? loader : this.getGraph('messagesInCount', messageInData, 'bundle')}
                    </div>
                  </div>
                </div>
              </div>
              {/*<div className="row  row-margin-bottom">
                <div className="col-md-4">
                  <div className="topology-foot-graphs">
                    <div className="metric-graph-title">Bytes In <span className="pull-right">25MB</span></div>
                    <div style={{
                      height: '65px',
                      textAlign: 'center'
                    }}>
                      {this.state.loadingRecord ? loader : this.getGraph('byteIn', bytesInData, 'step-before')}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="topology-foot-graphs">
                    <div  className="metric-graph-title">Bytes Out <span className="pull-right">25MB</span></div>
                    <div style={{
                      height: '65px',
                      textAlign: 'center'
                    }}>
                      {this.state.loadingRecord ? loader : this.getGraph('byteOut', bytesOutData, 'step-before')}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="topology-foot-graphs">
                    <div className="metric-graph-title">Total Bytes <span className="pull-right">217GB</span></div>
                    <div style={{
                      height: '65px',
                      textAlign: 'center'
                    }}>
                      {this.state.loadingRecord ? loader : this.getGraph('byteTotal', totalBytesData, 'step-before')}
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <div className="topology-foot-graphs">
                    <div className="metric-graph-title">Failed Fetch <span className="pull-right">19</span></div>
                    <div style={{
                      height: '65px',
                      textAlign: 'center'
                    }}>
                      {this.state.loadingRecord ? loader : this.getGraph('failedFetch', failedFetchData, 'step-before')}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="topology-foot-graphs">
                    <div className="metric-graph-title">Failed Produce <span className="pull-right">12</span></div>
                    <div style={{
                      height: '65px',
                      textAlign: 'center'
                    }}>
                      {this.state.loadingRecord ? loader : this.getGraph('failedProduce', failedProduceData, 'step-before')}
                    </div>
                  </div>
                </div>
              </div>*/}
            </div>
          </div>
        </div>
      </div>
    );
  }
}


TopicMetricsDetails.contextTypes = {
  router: PropTypes.object.isRequired
};
