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
import TopicMetricsDetails from './TopicMetricsDetails';
import DataExplorer from './DataExplorer';
import TopicConfigLogsDetails from './TopicConfigLogsDetails';
import TabSideComponent from '../CommonComponent/TabSideComponent';
import moment from 'moment';
import TopicREST from '../../rest/TopicREST';
import FSReactToastr from '../CommonComponent/FSReactToastr' ;
import CommonNotification from '../../utils/CommonNotification';
import ConsumerREST from '../../rest/ConsumerREST';
import Utils from '../../utils/Utils';
import {toastOpt} from '../../utils/Constants';
import MetricsREST from '../../rest/MetricsREST';


export default class TopicDetails  extends Component{
  constructor(props){
    super(props);
    this.state = {
      activeTabKey : props.location && props.location.state && props.location.state.showDataExplorer ? 2 : 1,
      tabSideComFlagStr : "metrics",
      startDate: moment().subtract(30, 'minutes'),
      endDate: moment(),
      selectedTopic :{},
      loading:false,
      producers: [],
      consumers:[],
      topicsMetrics:[],
      activePatition: props.location && props.location.state ? props.location.state.partition : null
    };
    app_state.headerContent = this.getHeaderContent();
  }

  componentDidMount(){
    this.getTopicFromLocationProps();
  }

  getTopicFromLocationProps = () => {
    const stateObj = this.state;
    const name = this.props.routeParams.topicname;
    const params=Utils.getItemFromLocalStorage("dateRange");

    this.setState({loading: true}, () => {

      MetricsREST.getAggregatedTopicMetrics(name, params).then((topic) => {
        stateObj.selectedTopic = topic;
        stateObj.loading = false;
        Utils.refTopicToPartition([topic]);
        stateObj.producers = Utils.getProducersFromTopicResponse(topic);
        stateObj.consumers = Utils.getConsumersFromTopicResponse(topic);

        const PromiseArr = [];

        PromiseArr.push(this.fetchTopicsMetrics(stateObj));

        Promise.all(PromiseArr).then((results) => {
          stateObj.loading = false;
          this.setState(stateObj);
        },(err) => {
          stateObj.loading = false;
          this.setState(stateObj);
          Utils.showResponseError(err);
        });

      }, (err) => {
        stateObj.loading = false;
        this.setState(stateObj);
        Utils.showResponseError(err);
      });

    });
  }

  fetchTopicsMetrics(obj) {
    const name = this.props.routeParams.topicname;
    const params=Utils.getItemFromLocalStorage("dateRange"), stateObj = obj !== undefined ? obj : this.state;
    return MetricsREST.getTopicsMetrics(name,params).then((res) => {
      stateObj.selectedTopic.metrics = res;
    });
  }

  getHeaderContent() {
    const topicName = this.props.routeParams.topicname;
    return (
      <span>
        <a href="#/topics">Topics</a>
        <span className="title-separator">/</span>
        <span className="">{topicName}</span>
      </span>
    );
  }

  datePickerHandler = (date) => {
    Utils.setItemToLocalStorage(date);
    this.getTopicFromLocationProps();
  }

  onSelectTab = (eventKey) => {
    let str = eventKey === 1
              ? "metrics"
              : eventKey === 2
                ? "explorer"
                : "config";
    this.setState({activeTabKey : eventKey,tabSideComFlagStr : str});
  }

  getTabContent(){
    const {activeTabKey,tabSideComFlagStr,startDate,endDate,selectedTopic,loading,consumers,producers,brokers,activePatition} = this.state;
    return <Tab.Content animation>
      <Tab.Pane eventKey={1}>
        <TopicMetricsDetails
          selectedTopic={selectedTopic}
          brokers={brokers}
          producers={producers}
          consumers={consumers}
          startDate={startDate}
          endDate={endDate}
          datePickerHandler={this.datePickerHandler}
        />
      </Tab.Pane>
      <Tab.Pane eventKey={2}>
        {activeTabKey === 2 || this.DataExplorerRef
          ? <DataExplorer
              ref={(ref) => this.DataExplorerRef = ref}
              viewMode="topicDetails"
              startDate={startDate}
              endDate={endDate}
              datePickerHandler={this.datePickerHandler}
              selectedTopic={selectedTopic}
              activePatition={activePatition}/>
          : ''
        }
      </Tab.Pane>
      <Tab.Pane eventKey={3}>
        {activeTabKey == 3 || this.ConfigRef ?
          <TopicConfigLogsDetails ref={(ref) => {this.ConfigRef = ref;}} selectedTopic={selectedTopic}/>
          : ''}
      </Tab.Pane>
    </Tab.Content>;
  }

  grafanaUrlCallback = () => {
    const {App} = this.context;
    const {selectedCluster, grafanaUrl} = App.state;

    const {selectedTopic} = this.state;
    const topicName = selectedTopic.name;
    if(grafanaUrl){
      const url = Utils.getGrafanaTopicUrl(grafanaUrl, topicName);
      window.open(url);
    }else{
      FSReactToastr.error(<CommonNotification flag="error" content={'Grafana url not found'}/>, '', toastOpt);
    }
  }
  atlasUrlCallback = () => {
    const {App} = this.context;
    const {selectedCluster, atlasUrl} = App.state;

    const {selectedTopic} = this.state;

    const topicName = selectedTopic.name;
    if(atlasUrl){
      const url = Utils.getAtlasTopicUrl(atlasUrl, topicName);
      window.open(url);
    }else{
      FSReactToastr.error(<CommonNotification flag="error" content={'Atlas url not found'}/>, '', toastOpt);
    }
  }

  render(){
    const {activeTabKey,tabSideComFlagStr,startDate,endDate,selectedTopic,loading,consumers} = this.state;

    const noData = !loading ? <div style={{textAlign: 'center'}}>No Data Found</div> : '';

    return(<Site>
      <Tab.Container id="tabs-with-dropdown" activeKey={activeTabKey}  onSelect={this.onSelectTab}>
        <div>
          <Row>
            <Col sm={12} className="tab-padding">
              <Nav bsStyle="tabs">
                <NavItem eventKey={1}>METRICS</NavItem>
                <NavItem eventKey={2}>DATA EXPLORER</NavItem>
                <NavItem eventKey={3}>CONFIGS</NavItem>
                {activeTabKey == 1 ?
                <TabSideComponent grafanaUrlCallback={this.grafanaUrlCallback} atlasUrlCallback={this.atlasUrlCallback} viewMode={tabSideComFlagStr} datePickerHandler={this.datePickerHandler} startDate={startDate} endDate={endDate}/>
                : null}
              </Nav>
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              {
                !_.isEmpty(selectedTopic)
                ? this.getTabContent()
                : noData
              }
            </Col>
          </Row>
        </div>
      </Tab.Container>
      {loading ? <div className="loading"></div> : null}
    </Site>);
  }
}

TopicDetails.contextTypes = {
  App: PropTypes.object
};
