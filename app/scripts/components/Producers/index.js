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
import {Tabs, Tab} from 'react-bootstrap';
import Site from '../Site';
import {ProducerPanelGroup} from '../CommonComponent/Panel';
import ListingPageHeader from '../CommonComponent/ListingPageHeader';
import app_state from '../../app_state';
import moment from 'moment';
import MetricsREST from '../../rest/MetricsREST';
import TopicREST from '../../rest/TopicREST';
import Utils from '../../utils/Utils';
import {ProducerSortComponent} from '../CommonComponent/ColumnSortComponent';

export default class Producers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePanel : 1,
      startDate: moment().subtract(30, 'minutes'),
      endDate: moment(),
      activePanelPool : [],
      loading: false,
      sort: '',
      producers:[],
      topics:[],
      filteredProducers: [],
      producerSort: {
        attr: 'clientId',
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
    const params=Utils.getItemFromLocalStorage("dateRange");

    this.setState({loading: true}, () => {
      let PromiseArr=[];
      PromiseArr.push(this.getProducersMetricsData(stateObj));

      Promise.all(PromiseArr).then((results) => {
        stateObj.loading = false;
        this.setState(stateObj);
      }, (err) => {
        stateObj.loading = false;
        this.setState(stateObj);
        Utils.showResponseError(err);
      });
    });
  }
  getProducersMetricsData = (obj) => {
    const stateObj = obj ? obj : this.state;
    const sortFlag = stateObj.sort === 'Asc' ? true : false;
    const params=Utils.getItemFromLocalStorage("dateRange");

    return MetricsREST.getAggregatedProducers(params).then((producers) => {
      stateObj.producers = Utils.getProducersFromProducerResponse(producers);
      stateObj.filteredProducers = stateObj.sort == '' ? producers :  Utils.sortArray(producers, "clientId", sortFlag);
    });
  }

  getHeaderContent() {
    return (
      <span>
        Producers
      </span>
    );
  }
  onFilter = (searchString) => {
    let {producers, filteredProducers} = this.state;
    if(searchString.trim() !== '') {
      filteredProducers = Utils.filterByName(producers, searchString, "clientId");
    } else {
      filteredProducers = producers;
    }
    this.setState({filteredProducers, searchString});
  }
  onSort = (eventKey) => {
    let {filteredProducers} = this.state;
    const sortFlag = eventKey === 'Asc' ? true : false;
    filteredProducers = Utils.sortArray(filteredProducers, "clientId", sortFlag);
    this.setState({sort: eventKey, filteredProducers});
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

  getFilteredAndSortedProducers = () => {
    let {producers, searchString, filteredProducers,producerSort} = this.state;
    if(searchString.trim() !== '') {
      filteredProducers = Utils.filterByName(producers, searchString, "clientId");
    } else {
      filteredProducers = producers;
    }
    if(producerSort.type !== ''){
      Utils.brokerSorting(filteredProducers, producerSort);
    }
    return filteredProducers;
  }

  render() {
    const {activePanel,activePanelPool,startDate,endDate, producers, topics, loading,
      producerSort} = this.state;
    const panelProps = {
      activePanelPool:activePanelPool,
      activeKey : activePanel,
      handleSelect : this.handleSelect.bind(this),
      toggleSideBar : app_state.sidebar_isCollapsed,
      topics:topics
    };

    const filteredProducers = this.getFilteredAndSortedProducers();

    const noData = !loading ? <div style={{textAlign: 'center'}}>No Data Found</div> : '';

    return (
      <Site>
        <ListingPageHeader
          ref="Filter"
          title={'Producers ('+ producers.length +')'}
          onFilter={this.onFilter}
          onSort={this.onSort}
          startDate={startDate}
          endDate={endDate}
          onDateChange={this.onDateChange}
        />
        {
          filteredProducers.length > 0
          ? [<ProducerSortComponent key={1} producerSort={producerSort} sortByAttr={this.sortByAttr}/>,
            <ProducerPanelGroup ke={2} data={filteredProducers} panelProps={panelProps}/>]
          : noData
        }

        {loading ? <div className="loading"></div> : null}
      </Site>
    );
  }
}
