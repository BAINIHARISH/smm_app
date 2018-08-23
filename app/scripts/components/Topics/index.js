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
import {Link} from 'react-router';
import {Tabs, Tab} from 'react-bootstrap';
import Site from '../Site';
import {TopicPanelGroup, BrokerPanelGroup} from '../CommonComponent/Panel';
import ListingPageHeader from '../CommonComponent/ListingPageHeader';
import TopicREST from '../../rest/TopicREST';
import Utils from '../../utils/Utils';
import Modal from '../CommonComponent/FSModal';
import DataExplorer from './DataExplorer';
import moment from 'moment';
import FSReactToastr from '../CommonComponent/FSReactToastr' ;
import CommonNotification from '../../utils/CommonNotification';
import {toastOpt} from '../../utils/Constants';
import MetricsREST from '../../rest/MetricsREST';
import {TopicSortComponent} from '../CommonComponent/ColumnSortComponent';

export default class Topics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      topics: [],
      filteredTopics: [],
      loading: false,
      sort: '',
      startDate: moment().subtract(30, 'minutes'),
      endDate: moment(),
      activePanel : 1,
      activePanelPool : [],
      selectedTopic:{},
      searchString: '',
      topicSort: {
        attr: 'name',
        type: ''
      },
      clusterMetrics: {}
    };
    app_state.headerContent = this.getHeaderContent();
  }
  componentDidMount(){
    this.fetchTopics();
    document.getElementsByClassName('search-input').item(0).focus();
  }
  fetchTopics(){
    let {sort} = this.state;
    const sortFlag = sort === 'Asc' ? true : false;
    const params=Utils.getItemFromLocalStorage("dateRange");

    this.setState({loading: true}, () => {
      MetricsREST.getAggregatedTopics(params).then((res) => {
        let topics = res.aggrTopicMetricsCollection;
        Utils.getProducersFromAggregatedTopics(topics);
        Utils.getConsumersFromAggregatedTopics(topics);
        Utils.refTopicToPartition(topics);
        this.setState({
          topics: topics,
          filteredTopics: (sort == '' ? topics : Utils.sortArray(topics, "name", sortFlag)),
          loading: false,
          clusterMetrics: _.omit(res, "aggrTopicMetricsCollection")
        });
      }, (err) => {
        this.setState({loading: false});
        Utils.showResponseError(err);
      });
    });
  }

  getHeaderContent() {
    return (
      <span>
        Topics
      </span>
    );
  }
  onFilter = (searchString) => {
    this.setState({searchString: searchString});
  }
  getFilteredAndSortedTopics(){
    let {topics, searchString, topicSort} = this.state;
    let filteredTopics = [];
    if(searchString.trim() !== '') {
      filteredTopics = Utils.filterByName(topics, searchString, "name");
    } else {
      filteredTopics = topics;
    }
    if(topicSort.type != ''){
      Utils.topicSorting(filteredTopics, topicSort);
    }
    return filteredTopics;
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

  topicModalResolve = () => {
    console.log("modal save clicked");
  }

  topicModalReject = () => {
    this.topicModal.hide();
  }

  showTopicModal = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    const name = evt.target.dataset.name;
    const obj = _.find(this.state.topics, (t) => t.name === name);
    if(!!obj){
      this.setState({selectedTopic : obj});
    }
    this.topicModal.show();
  }

  onDateChange = (date) => {
    Utils.setItemToLocalStorage(date);
    this.fetchTopics();
  }

  handleSelect = (eventKey) => {
    let tPool = _.cloneDeep(this.state.activePanelPool);
    const index = _.findIndex(tPool, (p) => p === eventKey);
    if(index !== -1){
      tPool.splice(index,1);
    } else {
      tPool.push(eventKey);
    }
    this.setState({activePanel:eventKey, activePanelPool : tPool});
  }

  render() {
    const {topics,startDate,endDate,activePanel,activePanelPool,selectedTopic, loading,
      topicSort, clusterMetrics} = this.state;
    const panelProps = {
      activePanelPool:activePanelPool,
      activeKey : activePanel,
      handleSelect : this.handleSelect.bind(this),
      showTopicModal : this.showTopicModal.bind(this),
      showProducerConsumer: true
    };

    const filteredTopics = this.getFilteredAndSortedTopics();

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
            <h6>In Sync Replicas</h6>
            <h4 title={clusterMetrics.inSyncReplicas || ''}>{_.isUndefined(clusterMetrics.inSyncReplicas) ? '' : clusterMetrics.inSyncReplicas.toLocaleString()}</h4>
          </div>
          <div>
            <h6>Out Of Sync</h6>
            <h4 title={clusterMetrics.outOfSyncReplicas || ''}>{_.isUndefined(clusterMetrics.outOfSyncReplicas) ? '' : clusterMetrics.outOfSyncReplicas.toLocaleString()}</h4>
          </div>
          <div>
            <h6>Under Replicated</h6>
            <h4 title={clusterMetrics.underReplicatedPartitions || ''}>{_.isUndefined(clusterMetrics.underReplicatedPartitions) ? '' : clusterMetrics.underReplicatedPartitions.toLocaleString()}</h4>
          </div>
          <div>
            <h6>Offline Partitions</h6>
            <h4 title={clusterMetrics.offlinePartitions || ''}>{_.isUndefined(clusterMetrics.offlinePartitions) ? '' : clusterMetrics.offlinePartitions.toLocaleString()}</h4>
          </div>
        </div>
        <ListingPageHeader
          ref="Filter"
          title={'Topics ('+ topics.length +')'}
          onFilter={this.onFilter}
          onSort={this.onSort}
          startDate={startDate}
          endDate={endDate}
          onDateChange={this.onDateChange}
        />
        {
          filteredTopics.length > 0
          ? [<TopicSortComponent key={1} topicSort={topicSort} sortTopicByAttr={this.sortByAttr}/>,
            <TopicPanelGroup key={2} data={filteredTopics}  panelProps={panelProps}/>]
          : noData
        }
        <Modal bsSize="large" dialogClassName="modal-xl" ref={(ref) => this.topicModal = ref} hideFooter data-title="Data Explorer" data-resolve={this.topicModalResolve} data-reject={this.topicModalReject}>
          <DataExplorer startDate={startDate} endDate={endDate} selectedTopic={selectedTopic}/>
        </Modal>
        {loading ? <div className="loading"></div> : null}
      </Site>
    );
  }
}
