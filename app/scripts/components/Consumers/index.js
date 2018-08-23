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
import {Link} from 'react-router';
import app_state from '../../app_state';
import {Tabs, Tab} from 'react-bootstrap';
import Site from '../Site';
import {ConsumerPanelGroup, BrokerPanelGroup} from '../CommonComponent/Panel';
import ListingPageHeader from '../CommonComponent/ListingPageHeader';
import moment from 'moment';
import ConsumerREST from '../../rest/ConsumerREST';
import TopicREST from '../../rest/TopicREST';
import MetricsREST from '../../rest/MetricsREST';
import Utils from '../../utils/Utils';
import {ConsumerSortComponent} from '../CommonComponent/ColumnSortComponent';

export default class Consumers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePanel : 1,
      startDate: moment().subtract(30, 'minutes'),
      endDate: moment(),
      activePanelPool : [],
      loading : false,
      sort: '',
      consumers : [],
      filteredConsumers: [],
      consumerSort: {
        attr: 'consumerGroupInfo.id',
        type: ''
      },
      searchString: ''
    };
    app_state.headerContent = this.getHeaderContent();
  }
  componentDidMount(){
    this.fetchData();
    document.getElementsByClassName('search-input').item(0).focus();
  }

  fetchData(){
    const stateObj= this.state;
    const params = Utils.getItemFromLocalStorage("dateRange");
    const sortFlag = stateObj.sort === 'Asc' ? true : false;
    this.setState({loading: true}, () => {
      let PromiseArr=[];
      PromiseArr.push(MetricsREST.getAggregatedConsumers(params));

      Promise.all(PromiseArr).then((results) => {
        let consumers = results[0];
        // add lagCount to consumer results.
        /*consumers = _.map(consumers, (result) => {
          result.lagCount = 0;
          _.map(result.consumerGroupInfo.topicPartitionAssignments,(topic)=>{
            _.map(topic, (p)=>{
              result.lagCount += p.lag;
            });
          });
          return result;
        });*/
        Utils.addLagCountInConsumers(consumers);
        stateObj.consumers = consumers;
        stateObj.filteredConsumers = stateObj.sort == '' ? consumers : Utils.sortArray(consumers, "consumerGroupInfo.id", sortFlag);
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
        Consumer Groups
      </span>
    );
  }
  onFilter = (searchString) => {
    let {consumers, filteredConsumers} = this.state;
    if(searchString.trim() !== '') {
      filteredConsumers = Utils.filterByName(consumers, searchString, "consumerGroupInfo.id");
    } else {
      filteredConsumers = consumers;
    }
    this.setState({filteredConsumers,searchString});
  }
  onSort = (eventKey) => {
    let {filteredConsumers} = this.state;
    const sortFlag = eventKey === 'Asc' ? true : false;
    filteredConsumers = Utils.sortArray(filteredConsumers, "consumerGroupInfo.id", sortFlag);
    this.setState({sort: eventKey, filteredConsumers});
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
  onDateChange = (date) => {
    Utils.setItemToLocalStorage(date);
    this.fetchData();
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

  getFilteredAndSortedConsumers = () => {
    let {consumers, filteredConsumers, searchString,consumerSort} = this.state;
    if(searchString.trim() !== '') {
      filteredConsumers = Utils.filterByName(consumers, searchString, "consumerGroupInfo.id");
    } else {
      filteredConsumers = consumers;
    }
    if(consumerSort.type !== ''){
      Utils.brokerSorting(filteredConsumers, consumerSort);
    }
    return filteredConsumers;
  }

  render() {
    const {activePanel,activePanelPool,startDate,endDate,consumers,topics,loading,consumerSort} = this.state;
    const panelProps = {
      activePanelPool:activePanelPool,
      activeKey : activePanel,
      handleSelect : this.handleSelect.bind(this),
      topics:topics
    };

    const noData = !loading ? <div style={{textAlign: 'center'}}>No Data Found</div> : '';

    const filteredConsumers = this.getFilteredAndSortedConsumers();

    return (
      <Site>
        <ListingPageHeader
          ref="Filter"
          title={`Consumer Groups (${consumers.length})`}
          onFilter={this.onFilter}
          onSort={this.onSort}
          startDate={startDate}
          endDate={endDate}
          onDateChange={this.onDateChange}
        />
        {
          filteredConsumers.length > 0
          ? [<ConsumerSortComponent  key={1} consumerSort={consumerSort} sortByAttr={this.sortByAttr}/>,
            <ConsumerPanelGroup key={2} data={filteredConsumers} panelProps={panelProps}/>]
          : noData
        }

        {loading ? <div className="loading"></div> : null}
      </Site>
    );
  }
}
