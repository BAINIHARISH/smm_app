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
import app_state from '../../app_state';
import _ from 'lodash';
import {Link} from 'react-router';
import Site from '../Site';
import {Tabs, Tab,Row,Col,Nav,NavItem} from 'react-bootstrap';
import ProducerMetricsDetails from './ProducerMetricsDetails';
import TabSideComponent from '../CommonComponent/TabSideComponent';
import moment from 'moment';
import ConsumerREST from '../../rest/ConsumerREST';
import Utils from '../../utils/Utils';
import MetricsREST from '../../rest/MetricsREST';
import TopicREST from '../../rest/TopicREST';


export default class ProducerDetails  extends Component{
  constructor(props){
    super(props);
    this.state = {
      activeTabKey : 1,
      tabSideComFlagStr : "metrics",
      startDate: moment().subtract(30, 'minutes'),
      endDate: moment(),
      loading:true,
      producer: {},
      producerGroupedByClientId: [],
      topics: [],
      consumers:[],
      tableRowData:[],
      summaryList:[{name : "Coverage",value : `100%`}]
    };
    app_state.headerContent = this.getHeaderContent();
  }

  componentDidMount(){
    this.fetchData();
  }

  fetchData(){
    const stateObj = this.state;
    const {duration} = stateObj;
    const producerClientId = this.props.routeParams.id;
    const params=Utils.getItemFromLocalStorage("dateRange");
    this.setState({loading: true}, () => {

      MetricsREST.getAggregatedProducerClient(producerClientId, params).then((producer) => {
        stateObj.producer = producer;
        stateObj.producerGroupedByClientId= Utils.getProducerFromProducerClient(producer);
        stateObj.loading = false;
        stateObj.consumers = Utils.getConsumersFromProducerClient(producer);

        this.setState(stateObj);

      },(err) => {
        stateObj.loading = false;
        this.setState(stateObj);
        Utils.showResponseError(err);
      });
    });
  }

  searchTopics = () => {
    const {producer} = this.state;
    const tempTopic =_.map(producer.topicPartitions, (t) => {
      return t.topic;
    });
    const topicsStr = _.uniq(tempTopic).join(',');
    this.setState({loading: true}, () => {
      TopicREST.searchTopics(topicsStr).then((result) => {
        this.setState({topics : result,loading:false});
      },(err) => {
        this.setState({loading: false});
        Utils.showResponseError(err);
      });
    });
  }

  getHeaderContent() {
    return (
      <span>
        <a href="#/producers">Producers</a>
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
              : "config";
    this.setState({activeTabKey : eventKey,tabSideComFlagStr : str});
  }

  getTabContent(){
    const {activeTabKey,tabSideComFlagStr,startDate,endDate,consumers,producer,producerGroupedByClientId,topics,tableRowData,summaryList} = this.state;
    return <Tab.Content animation>
      <Tab.Pane eventKey={1}>
        <ProducerMetricsDetails
          producer={producer}
          consumers={consumers}
          producerGroupedByClientId={producerGroupedByClientId}
          topics={topics}
          startDate={startDate}
          endDate={endDate}
          datePickerHandler={this.datePickerHandler}
          tableRowData={tableRowData}
          summaryList={summaryList}
        />
      </Tab.Pane>
      {/*<Tab.Pane eventKey={2}>
        Configs & Logs
      </Tab.Pane>*/}
    </Tab.Content>;
  }

  render(){
    const {activeTabKey,tabSideComFlagStr,startDate,endDate,consumers,loading,producer,topics} = this.state;

    const noData = !loading ? <div style={{textAlign: 'center'}}>No Data Found</div> : '';

    return(<Site>
      <Tab.Container id="tabs-with-dropdown" activeKey={activeTabKey}  onSelect={this.onSelectTab}>
        <Row className="clearfix">
          <Col sm={12}>
            <Nav bsStyle="tabs">
              <NavItem eventKey={1}>METRICS</NavItem>
              {/*<NavItem eventKey={2}>CONFIGS & LOGS</NavItem>*/}
              <TabSideComponent viewMode={tabSideComFlagStr} datePickerHandler={this.datePickerHandler} startDate={startDate} endDate={endDate}/>
            </Nav>
          </Col>
          <Col sm={12}>
            {
              !_.isEmpty(producer)
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
