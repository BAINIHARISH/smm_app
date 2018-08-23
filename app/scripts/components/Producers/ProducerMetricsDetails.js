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
import {ProgressBarPanel}  from '../CommonComponent/Panel.js';
import MetricNotification from '../CommonComponent/MetricNotification';
import {ProducerDetails} from '../CommonComponent/Panel';
import CommonSummaryAndTable from '../CommonComponent/CommonSummaryAndTable';
import Utils from '../../utils/Utils';
import {KafkaInline, getElementsToConnect} from '../../utils/Kafka-Graph';


export default class ProducerMetricsDetails extends Component{
  constructor(props){
    super(props);

    this.state = {
      loadingRecord: false,
      showMetrics : true,
      graphHeight: 65,
      pageSize: 5,
      noOfResults: 0,
      activePage:1
    };
  }

  componentDidMount(){
    const {tableRowData} = this.props;
    this.setState({noOfResults: tableRowData.length}, () => {
      this.drawKafkaGraph();
    });
    // this.Graph = new KafkaInline(getElementsToConnect({}), this.refs.KafkaGraphContainer);
  }

  generateFromAndToElement = () => {
    const {producer, topics, consumers} = this.props;
    let fromToElement=[];

    const pushFromToElement = function(fromTo){
      const existsFromTo = _.find(fromToElement, (_fromTo) => {
        return fromTo.from == _fromTo.from && fromTo.to == _fromTo.to;
      });
      if(!existsFromTo && fromTo.from && fromTo.to){
        fromToElement.push(fromTo);
      }
    };

    _.each(producer.wrappedPartitionMetrics, (partitions, topicName) => {
      _.each(partitions, (client, partition) => {
        const topicEl = document.querySelector(`[data-topicname=${topicName}][data-b-p${partition}]`);
        if(topicEl){
          const fromTo = {
            from: document.querySelector(`[data-producer="${producer.clientId}"]`),
            to : topicEl.querySelector('.hb')
          };
          pushFromToElement(fromTo);

          if(!_.isEmpty(client.consumerGroupIdToLag)){
            const consumerGroups = _.keys(client.consumerGroupIdToLag);
            _.each(consumerGroups, (consumer) => {
              const fromToConsumer = {
                from: topicEl,
                to : document.querySelector(`[data-consumer="${consumer}"]`)
              };
              pushFromToElement(fromToConsumer);
            });
          }
        }
      });
    });

    /*const topicPartitions = [];
    const elArr = _.map(producer.topicPartitions,(t) => {
      const topicPartition = topicPartitions.find((t2) => {
        return t2.topic == t.topic && t2.partition == t.partition;
      });
      if(!topicPartition){
        topicPartitions.push({
          topic: t.topic,
          partition: t.partition
        });
      }
    });

    _.each(topicPartitions, (t) => {
      const fromElement = document.querySelector(`[data-producer=${producer.clientId}]`);
      const toElement = document.querySelector(`[data-topicname=${t.topic}][data-b-p${t.partition}]`).querySelector('.hb');
      if(fromElement && toElement){
        fromToElement.push({
          from : fromElement,
          to : toElement
        });
      }
    });
    _.each(topicPartitions, (t) => {
      const consumer = _.find(consumers, (c) => {
        if(c.topicPartitions == null){
          return false;
        }
        return c.topicPartitions.findIndex((d) => {
          return d.topic == t.topic;
        }) !== -1;
      });
      if(consumer){
        const fromElement = document.querySelector(`[data-topicname=${t.topic}][data-b-p${t.partition}]`);
        const toElement = document.querySelector(`[data-consumer=${consumer.id}]`);
        if(fromElement && toElement){
          fromToElement.push({
            from : fromElement,
            to : toElement
          });
        }
      }
    });*/
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
    const list = ["instance","partition","lag","host","offset","log ends"];
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
    const {producer, producerGroupedByClientId, topics, consumers,tableRowData, summaryList} = this.props;
    const {pageSize,noOfResults,activePage} = this.state;
    let outMessagesCount = [];

    if(producer.outMessagesCount){
      const outMessagesCountTimespans = _.keys(producer.outMessagesCount).sort((a,b) => {
        return parseInt(a) - parseInt(b);
      });
      _.each(outMessagesCountTimespans, (timespan) => {
        outMessagesCount.push({
          date: new Date(parseInt(timespan)),
          'Messages Out': producer.outMessagesCount[timespan] || 0
        });
      });
    }

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
            <C_Producers data={producerGroupedByClientId}/>
            <div className="col-md-8 flex-col-8">
              <ProducerDetails data={producer} topics={topics}/>
            </div>
            <C_Consumers data={consumers}/>
          </div>
        </div>
        {/*<CommonSummaryAndTable
          columns={this.generateColumnsName()}
          summaryList={summaryList}
          pageSize={pageSize}
          noOfResults={noOfResults}
          activePage={activePage}
          tableData={tableRowData}
          columnSort={["partition"]}
          paginationCallback={this.paginationCallback}
        />*/}
        <div className="row">
        <div className="col-md-3">
          <div className="topology-foot-graphs">
            <div className="metric-graph-title">Messages Out<span className="pull-right"></span></div>
            <div style={{
              height: '65px',
              textAlign: 'center'
            }}>
              {this.state.loadingRecord ? loader : this.getGraph('outMessagesCount', outMessagesCount, 'bundle')}
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }
}
