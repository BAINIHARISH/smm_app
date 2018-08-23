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
import app_state from '../../app_state';
import _ from 'lodash';
import {Link} from 'react-router';
import Site from '../Site';
import {Tabs, Tab,Row,Col,Nav,NavItem} from 'react-bootstrap';
import moment from 'moment';
import TabSideComponent from '../CommonComponent/TabSideComponent';
import FSReactToastr from '../CommonComponent/FSReactToastr' ;
import CommonNotification from '../../utils/CommonNotification';
import {toastOpt} from '../../utils/Constants';
import Utils from '../../utils/Utils';
import BrokerMetricsDetails from './BrokerMetricsDetails';
import MetricsREST from '../../rest/MetricsREST';
import BrokerConfigLogsDetails from './BrokerConfigLogsDetails';

export default class BrokerDetails extends Component{
  constructor(props){
    super(props);
    this.state = {
      activeTabKey : 1,
      tabSideComFlagStr : "metrics",
      startDate: moment().subtract(30, 'minutes'),
      endDate: moment(),
      loading : false,
      selectedBroker: {},
      brokerMetrics: {},
      producers: [],
      consumers: []
    };
    app_state.headerContent = this.getHeaderContent();
  }
  componentDidMount(){
    this.fetchData();
  }

  fetchData(){
    const stateObj = this.state;
    const {selectedBroker} = stateObj;
    const params=Utils.getItemFromLocalStorage("dateRange");
    let brokerId = this.props.routeParams.brokerid;

    this.setState({loading: true}, () => {

      const PromiseArr = [];

      PromiseArr.push(MetricsREST.getAggregatedBrokerMetrics(brokerId, params).then((broker) => {
        stateObj.selectedBroker = broker;
        stateObj.selectedBroker.brokerId = brokerId;
        stateObj.brokerMetrics = broker;
        stateObj.producers = Utils.getProducerFromBrokerResponse(broker.producerDetails);
        stateObj.consumers = Utils.getConsumersFromBrokerResponse(broker.consumerDetails);
      }));

      Promise.all(PromiseArr).then((resps) => {
        stateObj.loading = false;
        this.setState(stateObj);
      }, (err) => {
        stateObj.loading = false;
        this.setState(stateObj);
        Utils.showResponseError(err);
      });
    });
  }

  getHeaderContent() {
    return (
      <span>
        <a href="#/brokers">Brokers</a>
        <span className="title-separator">/</span>
        <span className="">{this.props.routeParams.brokerid}</span>
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
    const {selectedBroker,brokerMetrics,startDate,endDate,producers,consumers, activeTabKey} = this.state;
    return <Tab.Content animation>
      <Tab.Pane eventKey={1}>
        <BrokerMetricsDetails
          selectedBroker={selectedBroker}
          startDate={startDate}
          endDate={endDate}
          datePickerHandler={this.datePickerHandler}
          brokerMetrics={brokerMetrics}
          producers={producers}
          consumers={consumers} />
      </Tab.Pane>
      <Tab.Pane eventKey={2}>
        {activeTabKey == 2 || this.ConfigRef ?
          <BrokerConfigLogsDetails ref={(ref) => {this.ConfigRef = ref;}} selectedBroker={selectedBroker}/>
          : ''}
      </Tab.Pane>
    </Tab.Content>;
  }
  grafanaUrlCallback = () => {
    const {App} = this.context;
    const {selectedCluster, grafanaUrl} = App.state;

    let brokerHost = this.state.selectedBroker.brokerNode.host;
    if(grafanaUrl){
      const url = Utils.getGrafanaBrokerUrl(grafanaUrl, brokerHost);
      window.open(url);
    }else{
      FSReactToastr.error(<CommonNotification flag="error" content={'Grafana url not found'}/>, '', toastOpt);
    }
  }
  ambariUrlCallback = () => {
    const {App} = this.context;
    const {selectedCluster} = App.state;

    let brokerHost = this.state.selectedBroker.brokerNode.host;
    const ambariUrl = selectedCluster.ambariUrl;
    if(ambariUrl){
      const url = Utils.getAmbariBrokerUrl(ambariUrl, brokerHost);
      window.open(url);
    }else{
      FSReactToastr.error(<CommonNotification flag="error" content={'Ambari url not found'}/>, '', toastOpt);
    }
  }

  render(){
    const {activeTabKey,tabSideComFlagStr,startDate,endDate,loading,selectedBroker} = this.state;
    const noData = !loading ? <div style={{textAlign: 'center'}}>No Data Found</div> : '';

    return(<Site>
      <Tab.Container id="tabs-with-dropdown" activeKey={activeTabKey}  onSelect={this.onSelectTab}>
        <Row className="clearfix">
          <Col sm={12} className="tab-padding">
            <Nav bsStyle="tabs">
              <NavItem eventKey={1}>METRICS</NavItem>
              <NavItem eventKey={2}>CONFIGS</NavItem>
              <TabSideComponent viewMode={tabSideComFlagStr} datePickerHandler={this.datePickerHandler} startDate={startDate} endDate={endDate}
                ambariUrlCallback={this.ambariUrlCallback}
                grafanaUrlCallback={this.grafanaUrlCallback} />
            </Nav>
          </Col>
          <Col sm={12}>
            {
              !_.isEmpty(selectedBroker)
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

BrokerDetails.contextTypes = {
  App: PropTypes.object
};