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
import _ from 'lodash';
import {C_Producers,C_Consumers} from '../CommonComponent/ProducerConsumerList';
import app_state from '../../app_state';
import TimeSeriesChart from '../Graph/TimeSeriesChart';
import moment from 'moment';
import {
  FormGroup,
  InputGroup,
  FormControl,
  Button,
  DropdownButton,
  MenuItem
} from 'react-bootstrap';
import {ProgressBarPanel}  from '../CommonComponent/Panel.js';
import MetricNotification from '../CommonComponent/MetricNotification';
import {BrokerDetails,BrokerDetails2} from '../CommonComponent/Panel';
import Utils from '../../utils/Utils';
import {KafkaInline, getElementsToConnect} from '../../utils/Kafka-Graph';


export default class BrokerMetricsDetails extends Component{
  constructor(props){
    super(props);

    this.state = {
      loadingRecord: false,
      showMetrics : true,
      graphHeight: 65,
      pageSize: 5,
      noOfResults:0,
      activePage:1
    };
  }

  componentDidMount(){
    this.drawKafkaGraph();
  }

  generateFromAndToElement = () => {
    const {selectedBroker} = this.props;
    const fromToElement = [];

    return fromToElement;
  }

  drawKafkaGraph(){
    const fromToElement = this.generateFromAndToElement();

    if(fromToElement.length){
      this.KafkaGraph = new KafkaInline(fromToElement, this.refs.KafkaGraphContainer);
    } else {
      console.error('No producer or consumer to connect');
    }
  }

  getGraph(name, data, interpolation) {
    const self = this;
    const colorRange = name ===  "lagRate" ? ['#f06261', '#a30000'] :  ['#44abc0', '#8b4ea6'];

    const startDate = data[0] ? data[0].date : this.props.startDate.toDate();
    const endDate = data[data.length-1] ? data[data.length-1].date : this.props.endDate.toDate();
    return <TimeSeriesChart color={d3.scale.category20c().range(colorRange)} ref={name} data={data} interpolation={interpolation} height={this.state.graphHeight} setXDomain={function() {
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
    }} drawBrush={()=>{}} />;
  }


  paginationCallback = (eventKey) => {
    this.setState({
      activePage: eventKey
    });
  }

  render(){
    const {pageSize,noOfResults,activePage} = this.state;
    const {selectedBroker,brokerMetrics,producers,consumers} = this.props;

    let cpuUsagePercentage = [],
      diskUsagePercentage = [],
      cpuLoad = [],
      memoryUsagePercentage = [];

    if(brokerMetrics){
      const timespans = _.keys(brokerMetrics.cpuUsagePercentage).sort((a,b) => {
        return parseInt(a) - parseInt(b);
      });
      _.each(timespans, (timespan) => {
        cpuUsagePercentage.push({
          date: new Date(parseInt(timespan)),
          'CPU Usage %': brokerMetrics.cpuUsagePercentage[timespan] || 0
        });
      });
      _.each(timespans, (timespan) => {
        diskUsagePercentage.push({
          date: new Date(parseInt(timespan)),
          'Disk Usage %': brokerMetrics.diskUsagePercentage[timespan] || 0
        });
      });
      _.each(timespans, (timespan) => {
        cpuLoad.push({
          date: new Date(parseInt(timespan)),
          'CPU Load': brokerMetrics.cpuLoad[timespan] || 0
        });
      });
      _.each(timespans, (timespan) => {
        memoryUsagePercentage.push({
          date: new Date(parseInt(timespan)),
          'Memory Usage %': brokerMetrics.memoryUsagePercentage[timespan] || 0
        });
      });
    }

    const loader = <img src="styles/img/start-loader.gif" alt="loading" style={{width: "50px",marginTop: "0px"}}/>;
    return(
      <div>
        <div className="row-margin-bottom clearfix background-adjust">
          <div className=" metric-body">
            <div className="metric-background"></div>
          </div>
          <div className="flexbox-container">
            <C_Producers data={producers} vAlign={true} enableActiveInactive={true}/>
            <div className="col-md-8 flex-col-8">
              {selectedBroker != null ? <BrokerDetails2 data={selectedBroker} /> : null}
            </div>
            <C_Consumers data={consumers} vAlign={true} enableActiveInactive={true} />
          </div>
        </div>
        <div className="col-sm-12">
          <div className="row  row-margin-bottom">
            <div className="col-md-3">
              <div className="topology-foot-graphs">
                <div className="metric-graph-title">CPU Usage %<span className="pull-right"></span></div>
                <div style={{
                  height: '65px',
                  textAlign: 'center'
                }}>
                  {this.state.loadingRecord ? loader : this.getGraph('cpuUsagePercentage', cpuUsagePercentage, 'bundle')}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="topology-foot-graphs">
                <div className="metric-graph-title">Disk Usage %<span className="pull-right"></span></div>
                <div style={{
                  height: '65px',
                  textAlign: 'center'
                }}>
                  {this.state.loadingRecord ? loader : this.getGraph('diskUsagePercentage', diskUsagePercentage, 'bundle')}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="topology-foot-graphs">
                <div className="metric-graph-title">CPU Load<span className="pull-right"></span></div>
                <div style={{
                  height: '65px',
                  textAlign: 'center'
                }}>
                  {this.state.loadingRecord ? loader : this.getGraph('cpuLoad', cpuLoad, 'bundle')}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="topology-foot-graphs">
                <div className="metric-graph-title">Memory Usage %<span className="pull-right"></span></div>
                <div style={{
                  height: '65px',
                  textAlign: 'center'
                }}>
                  {this.state.loadingRecord ? loader : this.getGraph('memoryUsagePercentage', memoryUsagePercentage, 'bundle')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
