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
import Site from '../Site';
import {BrokerPanelGroup} from '../CommonComponent/Panel';
import ListingPageHeader from '../CommonComponent/ListingPageHeader';
import TopicREST from '../../rest/TopicREST';
import BrokerREST from '../../rest/BrokerREST';
import moment from 'moment';
import Utils from '../../utils/Utils';
import MetricsREST from '../../rest/MetricsREST';
import {BrokerSortComponent} from '../CommonComponent/ColumnSortComponent';

export default class Brokers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      topics: [],
      brokers: [],
      loading: false,
      activePanel : 1,
      activePanelPool : [],
      startDate: moment().subtract(30, 'minutes'),
      endDate: moment(),
      searchString: '',
      brokerSort: {
        attr: 'node.id',
        type: ''
      },
      clusterMetrics: {}
    };
    app_state.headerContent = this.getHeaderContent();
  }
  componentDidMount(){
    this.fetchData();
    document.getElementsByClassName('search-input').item(0).focus();
  }
  fetchData(){
    const stateObj= this.state;
    const sortFlag = stateObj.sort === 'Asc' ? true : false;
    const params=Utils.getItemFromLocalStorage("dateRange");

    this.setState({loading: true}, () => {
      let PromiseArr=[];
      PromiseArr.push(MetricsREST.getAggregatedBrokers(params).then((res) => {
        stateObj.brokers = res.aggrBrokerMetricsCollection;
        stateObj.clusterMetrics = _.omit(res, "aggrBrokerMetricsCollection");
        // stateObj.filteredBrokers = stateObj.sort == '' ? brokers : Utils.sortArray(brokers, "node.id", sortFlag);
      }));

      PromiseArr.push(MetricsREST.getAggregatedTopics(params).then((res) => {
        let topics = res.aggrTopicMetricsCollection;
        Utils.refTopicToPartition(topics);
        stateObj.topics = topics;
      }));

      Promise.all(PromiseArr).then((results) => {
        stateObj.loading = false;
        Utils.brokerTopicSync(stateObj.brokers, stateObj.topics);
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
        Brokers
      </span>
    );
  }
  onFilter = (searchString) => {
    this.setState({searchString: searchString});
  }
  getFilteredAndSortedBrokers(){
    let {brokers, searchString, brokerSort} = this.state;
    let filteredBrokers = [];
    if(searchString.trim() !== '') {
      filteredBrokers = Utils.filterByName(brokers, searchString, "node.id");
    } else {
      filteredBrokers = brokers;
    }
    if(brokerSort.type != ''){
      Utils.brokerSorting(filteredBrokers, brokerSort);
    }
    return filteredBrokers;
  }
  sortByAttr = (dataset) => {
    this.setStateSortingObj(dataset);
  }

  setStateSortingObj = (dataset) => {
    const stateObj = _.cloneDeep(this.state);
    stateObj[dataset.fieldname].type = stateObj[dataset.fieldname].attr === dataset.name
                                  ? stateObj[dataset.fieldname].type === 'asc'
                                    ? 'desc'
                                    : 'asc'
                                  : 'asc';
    stateObj[dataset.fieldname].attr = dataset.name;
    this.setState(stateObj);
  }
  handleSelect = (eventKey) => {
    let tPool = _.cloneDeep(this.state.activePanelPool);
    const index = _.findIndex(tPool, (p) => p === parseInt(eventKey));
    if(index !== -1){
      tPool.splice(index,1);
    } else {
      tPool.push(parseInt(eventKey));
    }
    this.setState({activePanel:eventKey, activePanelPool : tPool});
  }
  onDateChange = (date) => {
    Utils.setItemToLocalStorage(date);
    this.fetchData();
  }
  render() {
    const {brokers, topics,activePanel,activePanelPool,startDate,endDate,loading,
    brokerSort,clusterMetrics} = this.state;
    const panelProps = {
      activePanelPool:activePanelPool,
      activeKey : activePanel,
      handleSelect : this.handleSelect.bind(this)
    };

    const filteredBrokers = this.getFilteredAndSortedBrokers();

    const noData = !loading ? <div style={{textAlign: 'center'}}>No Data Found</div> : '';

    return (
      <Site>
        <div className="cluster-metrics">
          <div>
            <h6>Total Bytes In</h6>
            <h4 title={clusterMetrics.totalBytesIn || ''}>{_.isUndefined(clusterMetrics.totalBytesIn) ? '' : Utils.bytesToSize(clusterMetrics.totalBytesIn)}</h4>
          </div>
          <div>
            <h6>Total Bytes Out</h6>
            <h4 title={clusterMetrics.totalBytesOut || ''}>{_.isUndefined(clusterMetrics.totalBytesOut) ? '' : Utils.bytesToSize(clusterMetrics.totalBytesOut)}</h4>
          </div>
          <div>
            <h6>Produced Per Sec</h6>
            <h4 title={clusterMetrics.producedPerSec || ''}>{_.isUndefined(clusterMetrics.producedPerSec) ? '' : parseInt(clusterMetrics.producedPerSec.toFixed(0), 10).toLocaleString()}</h4>
          </div>
          <div>
            <h6>Fetched Per Sec</h6>
            <h4 title={clusterMetrics.fetchedPerSec || ''}>{_.isUndefined(clusterMetrics.fetchedPerSec) ? '' : parseInt(clusterMetrics.fetchedPerSec.toFixed(0), 10).toLocaleString()}</h4>
          </div>
          <div>
            <h6>Active Controllers</h6>
            <h4 title={clusterMetrics.activeControllers || ''}>{_.isUndefined(clusterMetrics.activeControllers) ? '' : clusterMetrics.activeControllers.toLocaleString()}</h4>
          </div>
          <div>
            <h6>Unclean Elections</h6>
            <h4 title={clusterMetrics.uncleanLeaderElectionsPerSec || ''}>{_.isUndefined(clusterMetrics.uncleanLeaderElectionsPerSec) ? '' :  parseInt(clusterMetrics.uncleanLeaderElectionsPerSec.toFixed(0), 10).toLocaleString()}</h4>
          </div>
          <div>
            <h6>Request Pool Usage</h6>
            <h4 title={clusterMetrics.requestPoolUsage || ''}>{_.isUndefined(clusterMetrics.requestPoolUsage) ? '' : (clusterMetrics.requestPoolUsage.toFixed(2) + '%')}</h4>
          </div>
        </div>
        <ListingPageHeader
          ref="Filter"
          title={'Brokers ('+brokers.length+')'}
          onFilter={this.onFilter}
          onSort={this.onSort}
          startDate={startDate}
          endDate={endDate}
          onDateChange={this.onDateChange}
        />
        {
          filteredBrokers.length > 0
          ? [<BrokerSortComponent key={1} brokerSort={brokerSort} sortByAttr={this.sortByAttr}/>,
            <BrokerPanelGroup key={2} data={filteredBrokers} topics={topics} panelProps={panelProps}/>]
          : noData
        }
        {loading ? <div className="loading"></div> : null}
      </Site>
    );
  }
}
