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
import ReactDOM from 'react-dom';
import {Checkbox, Button} from 'react-bootstrap';
import _ from 'lodash';
import Utils from '../../utils/Utils';
import {Scrollbars} from 'react-custom-scrollbars';
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';

class FilterComponent extends Component {
  constructor(props){
    super(props);
    this.state = {
      isOpen:  false,
      searchValue: '',
      filteredEntities: props.data
    };
  }
  showList = (e) => {
    this.setState({isOpen: !this.state.isOpen}, () => {
      if(this.searchInput){
        this.searchInput.focus();
      }
    });
    if(!this.state.isOpen) {
      this.setState({searchValue: '', filteredEntities: this.props.data});
    }
  }
  componentDidUpdate() {
    this.getDropdownWidth();
  }
  componentDidMount() {
    this.getDropdownWidth();
  }
  getDropdownWidth(){
    const dropdown =document.querySelector('.dropdown.open');
    if(dropdown){
      const list = ReactDOM.findDOMNode(this.refs['list-containerRef']);
      list.style.width = dropdown.clientWidth+'px';
    }
  }
  handleSelectName(o, e) {
    let {selectedItems} = this.props;
    if(e.target.checked) {
      selectedItems.push(_.get(o,this.props.filterByAttribute));
    } else {
      selectedItems.splice(selectedItems.indexOf(_.get(o,this.props.filterByAttribute)), 1);
    }
    if(this.props.filterCallback) {
      this.props.filterCallback(selectedItems);
    }
  }
  handleSelectAll = (e) => {
    let {selectAll, filteredEntities} = this.state;
    let {selectedItems} = this.props;
    let self = this;
    if(e.target.checked) {
      filteredEntities.map((o)=>{
        if(selectedItems.indexOf(_.get(o,self.props.filterByAttribute)) == -1) {
          selectedItems.push(_.get(o,self.props.filterByAttribute));
        }
      });
    } else {
      filteredEntities.map((o)=>{
        selectedItems.splice(selectedItems.indexOf(_.get(o,this.props.filterByAttribute)), 1);
      });
    }
    if(this.props.filterCallback) {
      this.props.filterCallback(selectedItems);
    }
  }
  handleClearSelection = (e) => {
    e.stopPropagation();
    if(this.props.filterCallback) {
      this.props.filterCallback([]);
    }
  }
  handleSearch = (e) =>{
    let searchValue = e.target.value.trim();
    let filteredEntities = Utils.filterByName(this.props.data, searchValue, this.props.filterByAttribute);
    this.setState({filteredEntities: filteredEntities, searchValue: searchValue});
  }
  render() {
    let {title, data, selectedItems, active} = this.props;
    let {isOpen, searchValue, filteredEntities} = this.state;
    let selectAll = _.filter(filteredEntities, (o)=>{
      return selectedItems.indexOf(_.get(o,this.props.filterByAttribute)) > -1;
    }).length == filteredEntities.length;
    return (
        <div className={isOpen ? "dropdown open" : "dropdown"}>
          <button type="button"
            onClick={this.showList}
            className={`btn dropdown-toggle title-block ${active ? 'filter-active' : ''}`}
          >
            <div>
            <div style={{color: '#83e6ac'}}>{title}</div>
            {
              selectedItems.length == 0 ?
              <div style={{fontSize: '20px'}}>{data.length}</div>
              : <div style={{fontSize: '20px'}}>{selectedItems.length} of {data.length}</div>
            }
            {selectedItems.length > 0 && active?
            <div className="pull-right clear-filter-icon">
              <span onClick={this.handleClearSelection}><i className="fa fa-times"></i></span>
            </div>
            : null}
            <div className="pull-right" style={{position: 'absolute', top: '20px', right: '20px', color: '#83e6ac'}}>
              <span><i className={isOpen ? "fa fa-caret-up" : "fa fa-caret-down"}></i></span>
            </div>
          </div>
          </button>
          <RootCloseWrapper
            disabled={!isOpen}
            onRootClose={()=>{
              this.setState({isOpen: false});
            }}
            event='click'
          >
            <div className="dropdown-menu dropdown-menu-right" role="menu">
            <div ref="list-containerRef"  className="list-container">
              <div className="search-bar" style={{marginBottom: '10px'}}>
                <span className="input-group">
                  <input ref={ref => this.searchInput = ref} type="text" placeholder="Search" className="form-control" onChange={this.handleSearch} value={searchValue} />
                  <span className="input-group-addon">
                    <i className="fa fa-search"></i>
                  </span>
                </span>
              </div>
              {filteredEntities.length == 0 ?
                <span>No data found.</span>
              :
              <Scrollbars
                autoHide
                autoHeight
                autoHeightMin={30}
                autoHeightMax={285}
                renderThumbHorizontal={props => <div {...props} style={{ display: "none" }}/>}
              >
              <div className="list">
                <div className="dropdown-filters">
                  <div className="list-item"><Checkbox inline checked={selectAll} onChange={this.handleSelectAll}>Name</Checkbox></div>
                    {
                    filteredEntities.map((o, i)=>{
                      return(
                        <div key={i} className="list-item">
                          <Checkbox inline
                            checked={selectedItems.indexOf(_.get(o,this.props.filterByAttribute)) > -1 ? true : false}
                            onChange={this.handleSelectName.bind(this, o)}
                          >
                            {_.get(o,this.props.filterByAttribute).toString()}
                          </Checkbox>
                          <i style={{color: '#818181'}} className="fa fa-list-alt"></i>
                      </div>
                      );})
                    }
                </div>
                <hr />
              </div>
              </Scrollbars>
              }
            </div>
            </div>
          </RootCloseWrapper>
        </div>
    );
  }
}

export default class FiltersPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleClearAllFilters = (e) =>{
    this.refs.producerRef.handleClearSelection(e);
    this.refs.brokerRef.handleClearSelection(e);
    this.refs.consumerRef.handleClearSelection(e);
    this.refs.topicRef.handleClearSelection(e);
  }
  render() {
    const clusters = [];
    const {topics, topicAction, brokers, brokerAction, consumers, consumerAction, producers, producerAction,
      selectedTopics, selectedBrokers, selectedConsumers, selectedProducers, selectedFilter} = this.props;

    return (
      <div className="filters-panel">
        <div className="filters-panel-btn-container">
          <FilterComponent ref="producerRef" title="Producers" data={producers} selectedItems={selectedProducers} filterByAttribute="clientId" filterCallback={producerAction}
            active={selectedFilter == 'producers' ? true : false}/>
          <FilterComponent ref="brokerRef" title="Brokers" data={brokers} selectedItems={selectedBrokers} filterByAttribute="node.id" filterCallback={brokerAction}
            active={selectedFilter == 'brokers' ? true : false}/>
          <FilterComponent ref="topicRef" title="Topics" data={topics} selectedItems={selectedTopics} filterByAttribute="name" filterCallback={topicAction}
            active={selectedFilter == 'topics' ? true : false}/>
          <FilterComponent ref="consumerRef" title="Consumer Groups" data={consumers} selectedItems={selectedConsumers} filterByAttribute="consumerGroupInfo.id" filterCallback={consumerAction}
            active={selectedFilter == 'consumers' ? true : false}/>
        </div>
        <Button type="button" className="clear-filter-btn" onClick={this.handleClearAllFilters}>Clear</Button>
      </div>
    );
  }
}
