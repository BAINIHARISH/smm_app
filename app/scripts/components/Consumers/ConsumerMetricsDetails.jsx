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
import {C_Producers,C_Consumer_Clients} from '../CommonComponent/ProducerConsumerList';
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
import {ConsumerDetails2} from '../CommonComponent/Panel';
import CommonSummaryAndTable from '../CommonComponent/CommonSummaryAndTable';
import Utils from '../../utils/Utils';
import {KafkaInline, getElementsToConnect} from '../../utils/Kafka-Graph';


export default class ConsumerMetricsDetails extends Component{
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
    const {tableRowData} = this.props;
    this.setState({noOfResults: tableRowData.length}, () => {
      this.drawKafkaGraph();
    });
  }

  generateFromAndToElement = () => {
    const {selectedConsumer} = this.props;
    const consumer = selectedConsumer;

    const fromToElement = [];

    const pushFromToElement = function(fromTo){
      const existsFromTo = _.find(fromToElement, (_fromTo) => {
        return fromTo.from == _fromTo.from && fromTo.to == _fromTo.to;
      });
      if(!existsFromTo && fromTo.from && fromTo.to){
        fromToElement.push(fromTo);
      }
    };

    _.each(consumer.consumerGroupInfo.topicPartitionAssignments, (partitions, topicName) => {
      _.each(partitions, (client, partition) => {
        const fromTo = {
          from : document.querySelector(`[data-topicname=${topicName}][data-b-p${partition}]`),
          to: document.querySelector(`[data-consumer="${client.clientId}"]`)
        };
        pushFromToElement(fromTo);
      });
    });

    _.each(consumer.wrappedPartitionMetrics, (partitions, topicName) => {
      _.each(partitions, (obj, partition) => {
        const producers = _.keys(obj.producerIdToOutMessagesCount);
        _.each(producers, (p) => {
          const topicEl = document.querySelector(`[data-topicname=${topicName}][data-b-p${partition}]`);
          if(topicEl){
            const fromTo = {
              from: document.querySelector(`[data-producer="${p}"]`),
              to : topicEl.querySelector('.hb')
            };
            pushFromToElement(fromTo);
          }
        });
      });
    });

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

  generateColumnsName = () => {
    const list = ["instance","topic", "partition","lag","host","offset","log ends"];
    let columns=[];
    _.map(list, (l) => {
      columns.push({
        key : l,
        displayName : Utils.capitaliseFirstLetter(l),
        renderHeader : () => {return <div style={{display : "inline-block"}}>{Utils.capitaliseFirstLetter(l)}</div>;},
        renderRow : (item) => {
          return <div style={{display : "inline-block"}}>{item[l]}</div>;
        }
      });
    });
    return columns;
  }

  getGraph(name, data, interpolation) {
    const self = this;
    const colorRange = ['#44abc0', '#8b4ea6'];

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
    const {pageSize,noOfResults,activePage,selectedTopicParitionForGraph} = this.state;
    const {selectedConsumer,summaryList,tableRowData,topics,producers,consumerGroupedByClientId,consumerMetrics} = this.props;
    const committedOffsets = [];
    const committedOffsetsRate = [];
    const lag = [];
    const lagRate = [];
    const selectedGroupPartitionMetrics = consumerMetrics;

    if(selectedGroupPartitionMetrics){
      const committedOffsetsTimespans = _.keys(selectedGroupPartitionMetrics.committedOffsets).sort((a,b) => {
        return parseInt(a) - parseInt(b);
      });
      _.each(committedOffsetsTimespans, (timespan) => {
        committedOffsets.push({
          date: new Date(parseInt(timespan)),
          'Committed Offset': selectedGroupPartitionMetrics.committedOffsets[timespan] || 0
        });
      });

      _.each(committedOffsetsTimespans, (timespan) => {
        committedOffsetsRate.push({
          date: new Date(parseInt(timespan)),
          'Committed Offsets Rate': selectedGroupPartitionMetrics.committedOffsetsRate[timespan] || 0
        });
      });

      _.each(committedOffsetsTimespans, (timespan) => {
        lag.push({
          date: new Date(parseInt(timespan)),
          'Lag': selectedGroupPartitionMetrics.lag[timespan] || 0
        });
      });

      _.each(committedOffsetsTimespans, (timespan) => {
        lagRate.push({
          date: new Date(parseInt(timespan)),
          'Lag Rate': selectedGroupPartitionMetrics.lagRate[timespan] || 0
        });
      });

    }

    const graphDropDownMenuItems = [];
    _.each(selectedConsumer.wrappedPartitionMetrics, (partitions, topicName) => {
      _.each(partitions, (partitionMetrics, partition) => {
        const key = topicName+'-P'+partition;
        graphDropDownMenuItems.push(<MenuItem  key={key} active={`${selectedTopicParitionForGraph}` === `${key}` ? true : false}  eventKey={`${key}`}>
          {key}
        </MenuItem>);
      });
    });

    const loader = <img src="styles/img/start-loader.gif" alt="loading" style={{width: "50px",marginTop: "0px"}}/>;
    return(
      <div className="detail-container">
        <div className="row-margin-bottom clearfix background-adjust">
          {/*metric-body is just for background color overlay*/}
          <div className=" metric-body">
            <div className="metric-background"></div>
          </div>
            <div ref="KafkaGraphContainer" className="kafka-graph-inline-container"></div>
            <div className="flexbox-container">
              <C_Producers data={producers}/>
              <div className="col-md-8 flex-col-8">
                  <ConsumerDetails2 panelProps={{topics}} data={selectedConsumer}/>
              </div>
              <C_Consumer_Clients data={consumerGroupedByClientId} instanceType={true}/>
            </div>
        </div>
        <CommonSummaryAndTable
          columns={this.generateColumnsName()}
          summaryList={summaryList}
          pageSize={pageSize}
          noOfResults={noOfResults}
          activePage={activePage}
          tableData={tableRowData}
          columnSort={["partition"]}
          paginationCallback={this.paginationCallback}/>
        <div className="col-sm-12">
          <div className="row  row-margin-bottom">
            <div className="col-md-3">
              <div className="topology-foot-graphs">
                <div className="metric-graph-title">Committed Offsets<span className="pull-right"></span></div>
                <div style={{
                  height: '65px',
                  textAlign: 'center'
                }}>
                  {this.state.loadingRecord ? loader : this.getGraph('committedOffsets', committedOffsets, 'bundle')}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="topology-foot-graphs">
                <div className="metric-graph-title">Committed Offsets Rate<span className="pull-right"></span></div>
                <div style={{
                  height: '65px',
                  textAlign: 'center'
                }}>
                  {this.state.loadingRecord ? loader : this.getGraph('committedOffsetsRate', committedOffsetsRate, 'step-before')}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="topology-foot-graphs">
                <div className="metric-graph-title">Lag<span className="pull-right"></span></div>
                <div style={{
                  height: '65px',
                  textAlign: 'center'
                }}>
                  {this.state.loadingRecord ? loader : this.getGraph('lag', lag, 'step-before')}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="topology-foot-graphs">
                <div className="metric-graph-title">Lag Rate<span className="pull-right"></span></div>
                <div style={{
                  height: '65px',
                  textAlign: 'center'
                }}>
                  {this.state.loadingRecord ? loader : this.getGraph('lagRate', lagRate, 'step-before')}
                </div>
              </div>
            </div>
          </div>
          {/*<div  className="row">
            <div className="col-md-3">
              <div className="topology-foot-graphs">
                <div className="metric-graph-title">Consumption Rate<span className="pull-right">217</span></div>
                <div style={{
                  height: '65px',
                  textAlign: 'center'
                }}>
                  {this.state.loadingRecord ? loader : this.getGraph('consumption', consumptionRateData, 'step-before')}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="topology-foot-graphs">
                <div className="metric-graph-title">Records Per Request<span className="pull-right">100</span></div>
                <div style={{
                  height: '65px',
                  textAlign: 'center'
                }}>
                  {this.state.loadingRecord ? loader : this.getGraph('records', recordsData, 'step-before')}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="topology-foot-graphs">
                <div className="metric-graph-title">Fetch Size<span className="pull-right">23MB</span></div>
                <div style={{
                  height: '65px',
                  textAlign: 'center'
                }}>
                  {this.state.loadingRecord ? loader : this.getGraph('fetchSize', fetchSizeData, 'step-before')}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="topology-foot-graphs">
                <div className="metric-graph-title">Fetch Latency<span className="pull-right">23Sec</span></div>
                <div style={{
                  height: '65px',
                  textAlign: 'center'
                }}>
                  {this.state.loadingRecord ? loader : this.getGraph('fetchLatency', fetchLatencyData, 'bundle')}
                </div>
              </div>
            </div>
          </div>*/}
        </div>
      </div>
    );
  }
}
