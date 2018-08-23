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
import app_state from '../../app_state';
import {Link} from 'react-router';
import Site from '../Site';
import {Tabs, Tab,Row,Col,Nav,NavItem} from 'react-bootstrap';
import moment from 'moment';
import TabSideComponent from '../CommonComponent/TabSideComponent';
import ConsumerConfigLogDetails from './ConsumerConfigLogDetails';
import ConsumerMetricsDetails from './ConsumerMetricsDetails';
import ConsumerREST from '../../rest/ConsumerREST';
import TopicREST from '../../rest/TopicREST';
import MetricsREST from '../../rest/MetricsREST';
import Utils from '../../utils/Utils';

export default class ConsumersDetails extends Component{
  constructor(props){
    super(props);
    this.state = {
      activeTabKey : 1,
      tabSideComFlagStr : "metrics",
      startDate: moment().subtract(30, 'minutes'),
      endDate: moment(),
      selectedConsumer : {},
      consumerGroupedByClientId: [],
      loading : false,
      tableRowData:[],
      summaryList : [
        // {name : "Coverage",value : `100%`}
      ],
      topics : [],
      producers:[],
      consumerMetrics: {}
    };
    app_state.headerContent = this.getHeaderContent();
  }

  componentDidMount(){
    this.fetchData();
  }

  fetchData(){
    const stateObj = this.state;
    const {selectedConsumer,summaryList} = stateObj;
    const params=Utils.getItemFromLocalStorage("dateRange");
    // params.requireTimelineMetrics = true;
    let consumerId = this.props.routeParams.id;

    this.setState({loading: true}, () => {

      const PromiseArr = [];

      PromiseArr.push(MetricsREST.getAggregatedConsumerGroup(consumerId, params).then((consumer) => {
        stateObj.selectedConsumer = consumer;

        const {rowData,totalLag} = Utils.getTableRowData(consumer.consumerGroupInfo);
        stateObj.tableRowData = rowData;
        stateObj.selectedConsumer.lagCount = totalLag;
        stateObj.summaryList = [{name : "Total Lag" , value : totalLag}];
        stateObj.producers = Utils.getProducerFromConsumerGroupResponse(consumer);
        stateObj.consumerGroupedByClientId = Utils.getConsumerFromConsumerResponse(consumer);
      }, (err) => {
        Utils.showResponseError(err);
      }));

      PromiseArr.push(MetricsREST.getGroupPartitionMetrics(consumerId, params).then((consumerMetrics) => {
        stateObj.consumerMetrics = consumerMetrics;
      }, (err) => {
        Utils.showResponseError(err);
      }));

      Promise.all(PromiseArr).then((resps) => {
        stateObj.loading = false;
        this.setState(stateObj);
      }, (err) => {
        stateObj.loading = false;
        this.setState(stateObj);
      });
    });
  }

  getHeaderContent() {
    return (
      <span>
        <a href="#/consumers">Consumer Groups</a>
        <span className="title-separator">/</span>
        <span className="">{this.props.routeParams.id}</span>
      </span>
    );
  }

  datePickerHandler = (date) => {
    Utils.setItemToLocalStorage(date);
    this.fetchData();
  }

  onSelectTab = (eventKey) => {
    let str = eventKey === 1
              ? "metrics"
              : eventKey === 2
                ? "config"
                : "explorer";
    this.setState({activeTabKey : eventKey,tabSideComFlagStr : str});
  }

  getTabContent(){
    const {activeTabKey,tabSideComFlagStr,startDate,endDate,selectedConsumer,tableRowData,summaryList,topics,producers,
      consumerGroupedByClientId, consumerMetrics } = this.state;
    return <Tab.Content animation>
      <Tab.Pane eventKey={1}>
        <ConsumerMetricsDetails
          summaryList={summaryList}
          tableRowData={tableRowData}
          selectedConsumer={selectedConsumer}
          consumerGroupedByClientId={consumerGroupedByClientId}
          topics={topics}
          producers={producers}
          startDate={startDate}
          endDate={endDate}
          datePickerHandler={this.datePickerHandler}
          consumerMetrics={consumerMetrics}
          />
      </Tab.Pane>
      {/*<Tab.Pane eventKey={2}>
        <ConsumerConfigLogDetails />
      </Tab.Pane>*/}
    </Tab.Content>;
  }

  render(){
    const {activeTabKey,tabSideComFlagStr,startDate,endDate,selectedConsumer,loading,tableRowData,summaryList,topics} = this.state;

    const noData = !loading ? <div style={{textAlign: 'center'}}>No Data Found</div> : '';

    return(<Site>
      <Tab.Container id="tabs-with-dropdown" activeKey={activeTabKey}  onSelect={this.onSelectTab}>
        <Row className="clearfix">
          <Col sm={12} className="tab-padding">
            <Nav bsStyle="tabs">
              <NavItem eventKey={1}>METRICS</NavItem>
              {/*<NavItem eventKey={2}>CONFIGS & LOGS</NavItem>*/}
              <TabSideComponent viewMode={tabSideComFlagStr} datePickerHandler={this.datePickerHandler} startDate={startDate} endDate={endDate}/>
            </Nav>
          </Col>
          <Col sm={12}>
            {
              !_.isEmpty(selectedConsumer)
              ? this.getTabContent()
              : noData
            }
          </Col>
        </Row>
      </Tab.Container>
      {loading ? <div className="loading"></div> : null}
    </Site>);
  }
}
