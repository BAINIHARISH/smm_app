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
import {Tabs, Tab,OverlayTrigger, Popover, ButtonGroup, Button} from 'react-bootstrap';
import Utils from '../../utils/Utils';

class SideContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedState: 'active'
    };
  }
  getTitle(){
    return null;
  }
  getList(){
    return null;
  }
  getActiveInactiveComponent(){
  }
  getActiveInactiveData(){
  }
  render() {
    const {vAlign, enableActiveInactive, data} = this.props;
    let list = data;

    let actInactData = {};
    if(enableActiveInactive){
      actInactData = this.getActiveInactiveData();
      list = actInactData.list;
    }

    return (
      <div className="col-md-2 flex-col-2">
        <div className={`side-widget ${vAlign ? 'flex-itembox flexbox-container' : ''}`}>
          {this.getTitle()}
          <div style={{'flexGrow':1, width: "100%"}}>
            {enableActiveInactive ? this.getActiveInactiveComponent(actInactData) : null}
            {this.getTypeComp()}
            {this.getList(list)}
          </div>
        </div>
      </div>
    );
  }
}

SideContainer.defaultProps = {
  vAlign: true,
  enableActiveInactive: false
};

class C_Producers extends SideContainer {
  getActiveInactiveComponent({activeCount, inActiveCount}){
    const {selectedState} = this.state;
    const activeText = `ACTIVE (${activeCount})`;
    const inActiveText = `PASSIVE (${inActiveCount})`;
    const allText = `ALL`;
    return <ButtonGroup
      className="active-inactive-btn-container producer-state"
    >
      <Button className={`${selectedState == 'active' ? 'active' : ''}`}
      title={'Producers which are considered to be active. They are considered active only if they have at least a metric for last 30 mins.'}
      onClick={() => {
        this.setState({selectedState: 'active'});
      }}>{activeText}</Button>
      <Button className={`${selectedState == 'inactive' ? 'active' : ''}`}
      title={'Producers which are considered to be not active.'}
      onClick={() => {
        this.setState({selectedState: 'inactive'});
      }}>{inActiveText}</Button>
      <Button className={`${selectedState == 'all' ? 'active' : ''} all-btn`}
      title={'All producers.'}
      onClick={() => {
        this.setState({selectedState: 'all'});
      }}>{allText}</Button>
    </ButtonGroup>;
  }
  getActiveInactiveData(){
    const {data} = this.props;
    const {selectedState} = this.state;
    let activeCount = 0, inActiveCount = 0, list = data;
    if(selectedState == 'active'){
      list = _.filter(data, this.activeFilterCallBack);
      activeCount = list.length;
      inActiveCount = data.length - activeCount;
    }else if(selectedState == 'inactive'){
      list = _.filter(data, this.inActiveFilterCallBack);
      inActiveCount = list.length;
      activeCount = data.length - inActiveCount;
    }else{
      list = data;
      const activeList = _.filter(data, this.activeFilterCallBack);
      activeCount = activeList.length;
      inActiveCount = data.length - activeCount;
    }
    return {list, activeCount, inActiveCount};
  }
  activeFilterCallBack(d){
    return d.active == true;
  }
  inActiveFilterCallBack(d){
    return d.active == false;
  }
  getTitle(){
    const {data} = this.props;
    return <h4>
      Producers ({data.length})
    </h4>;
  }
  getTypeComp(){
    const {data,sidePanelSorting,producerSort={},enableSort} = this.props;
    if(data.length){
      const sortableIcon = enableSort ? <i className="sort-arrow fa fa-sort" style={{color: 'rgba(145, 145, 145, 0.64)'}}></i> : null;
      return <p data-fieldName="producerSort" data-name="latestOutMessagesCount" onClick={sidePanelSorting ? sidePanelSorting : null}>
        MESSAGES
        {
          producerSort.type !== '' && enableSort
          ? producerSort.type === 'asc'
            ? <i className="sort-arrow fa fa-caret-down"></i>
            : <i className="sort-arrow fa fa-caret-up"></i>
          : sortableIcon
        }
      </p>;
    }else{
      return null;
    }
  }
  showOverlay(i) {
    this.refs['overlay'+i].show();
  }
  hideOverlay(i) {
    this.refs['overlay'+i].hide();
  }
  filterProducer(id) {
    this.props.producerAction([id]);
  }
  getList(data){
    return <ul className="side-widget-list">
      {_.map(data, (d, i) => {
        let messagesCount = 0;
        _.each(d.partitionToInMessageCount, (val) => {
          messagesCount += val;
        });
        // messagesCount = parseInt(messagesCount);
        let {value, suffix} = Utils.abbreviateNumber(messagesCount);
        return <OverlayTrigger
          key={i}
          ref={"overlay"+i}
          trigger={['hover']}
          placement="bottom"
          delayHide={100}
          overlay={
            <Popover
              id="popover-side-widget-item"
              className="popover-zIndex"
              onMouseOver={this.showOverlay.bind(this, i)}
              onMouseOut={this.hideOverlay.bind(this, i)}
            >
            <h4 style={{wordWrap: 'break-word'}}>Producer: {d.clientId}</h4>
              <div style={{padding: '5px 0'}}><span>MESSAGES </span>{messagesCount}</div>
              {this.props.onClick?
              <div>
                <Link to={"/producers/"+d.clientId}>PROFILE</Link>
                <a onClick={this.filterProducer.bind(this, d.clientId)}>FILTER</a>
              </div>
              : null
              }
            </Popover>
          }>
            <li onClick={this.props.onClick} data-producer={d.clientId}>
              <span className="side-widget-list-item">{d.clientId}</span>
              <span className="pull-right">{value+''+suffix}</span>
            </li>
          </OverlayTrigger>;
      })}
    </ul>;
  }
}

class C_Consumers extends SideContainer {
  getActiveInactiveComponent({activeCount = 0, inActiveCount = 0}){
    const {selectedState} = this.state;
    const activeText = `ACTIVE (${activeCount})`;
    const inActiveText = `PASSIVE (${inActiveCount})`;
    const allText = `ALL`;
    return <ButtonGroup
      className="active-inactive-btn-container consumer-state"
    >
      <Button className={`${selectedState == 'active' ? 'active' : ''}`}
      title={'This includes all consumer groups which use consumer group management and it has active consumers.'}
      onClick={() => {
        this.setState({selectedState: 'active'});
      }}>{activeText}</Button>
      <Button className={`${selectedState == 'inactive' ? 'active' : ''}`}
      title={'Consumer groups which are considered to be inactive. This may include active consumers which are not using consumer group management.'}
      onClick={() => {
        this.setState({selectedState: 'inactive'});
      }}>{inActiveText}</Button>
      <Button className={`${selectedState == 'all' ? 'active' : ''} all-btn`}
      title={'All consumer groups.'}
      onClick={() => {
        this.setState({selectedState: 'all'});
      }}>{allText}</Button>
    </ButtonGroup>;
  }
  getActiveInactiveData(){
    const {data} = this.props;
    const {selectedState} = this.state;
    let activeCount = 0, inActiveCount = 0, list = data;
    if(selectedState == 'active'){
      list = _.filter(data, this.activeFilterCallBack);
      activeCount = list.length;
      inActiveCount = data.length - activeCount;
    }else if(selectedState == 'inactive'){
      list = _.filter(data, this.inActiveFilterCallBack);
      inActiveCount = list.length;
      activeCount = data.length - inActiveCount;
    }else{
      list = data;
      const activeList = _.filter(data, this.activeFilterCallBack);
      activeCount = activeList.length;
      inActiveCount = data.length - activeCount;
    }
    return {list, activeCount, inActiveCount};
  }
  activeFilterCallBack(d){
    return d.consumerGroupInfo.active == true;
  }
  inActiveFilterCallBack(d){
    return d.consumerGroupInfo.active == false;
  }
  getTitle(){
    const {data} = this.props;
    return <h4>
      Consumer Groups ({data.length})
    </h4>;
  }
  getTypeComp(){
    const {data,sidePanelSorting,consumerSort={},enableSort} = this.props;
    if(data.length){
      const sortableIcon = enableSort ? <i className="sort-arrow fa fa-sort" style={{color: 'rgba(145, 145, 145, 0.64)'}}></i> : null;
      return <p data-fieldName="consumerSort" data-name="lagCount"  onClick={sidePanelSorting ? sidePanelSorting : null}>
        LAG
        {
          consumerSort.type !== '' && enableSort
          ? consumerSort.type === 'asc'
            ? <i className="sort-arrow fa fa-caret-down"></i>
            : <i className="sort-arrow fa fa-caret-up"></i>
          : sortableIcon
        }
      </p>;
    }else{
      return null;
    }
  }
  showOverlay(i) {
    this.refs['overlay'+i].show();
  }
  hideOverlay(i) {
    this.refs['overlay'+i].hide();
  }
  filterConsumer(id) {
    this.props.consumerAction([id]);
  }
  getList(data){
    return <ul className="side-widget-list">
      {_.map(data, (d, i) => {
        const id = d.consumerGroupInfo ? d.consumerGroupInfo.id : d.id;
        const {value, suffix} = Utils.abbreviateNumber(d.lagCount);
        return  <OverlayTrigger
          key={i}
          ref={"overlay"+i}
          trigger={['hover']}
          placement="bottom"
          delayHide={100}
          overlay={
            <Popover
              id="popover-side-widget-item"
              className="popover-zIndex"
              onMouseOver={this.showOverlay.bind(this, i)}
              onMouseOut={this.hideOverlay.bind(this, i)}
            >
              <h4 style={{wordWrap: 'break-word'}}>Consumer Groups: {id}</h4>
              <div style={{padding: '5px 0'}}><span>LAG </span>{d.lagCount}</div>
              {this.props.onClick?
              <div>
                <Link to={"/consumers/"+id}>PROFILE</Link>
                <a onClick={this.filterConsumer.bind(this, id)}>FILTER</a>
              </div>
              : null
              }
            </Popover>
          }>
          <li onClick={this.props.onClick} data-consumer={id}>
            <span className="side-widget-list-item">{id}</span>
            <span className="pull-right">{value+suffix}</span>
          </li>
        </OverlayTrigger>;
      })}
    </ul>;
  }
}

class C_Consumer_Clients extends C_Consumers{
  getTitle(){
    const {data} = this.props;
    return <h4>
      Consumers ({data.length})
    </h4>;
  }
  getTypeComp(){
    const {data,sidePanelSorting} = this.props;
    if(data.length){
      return <p data-fieldName="consumerSort" data-name="lagCount"  onClick={sidePanelSorting ? sidePanelSorting : null}>LAG</p>;
    }else{
      return null;
    }
  }
  showOverlay(i) {
    this.refs['overlay'+i].show();
  }
  hideOverlay(i) {
    this.refs['overlay'+i].hide();
  }
  getList(data){
    return <ul className="side-widget-list">
      {_.map(data, (d, i) => {
        const {value, suffix} = Utils.abbreviateNumber(d.lagCount);
        return  <OverlayTrigger
          key={i}
          ref={"overlay"+i}
          trigger={['hover']}
          placement="bottom"
          delayHide={100}
          overlay={
            <Popover
              id="popover-side-widget-item"
              className="popover-zIndex"
              onMouseOver={this.showOverlay.bind(this, i)}
              onMouseOut={this.hideOverlay.bind(this, i)}
            >
              <h4 style={{wordWrap: 'break-word'}}>Consumer : {d.id}</h4>
              <div style={{padding: '5px 0'}}><span>LAG </span>{d.lagCount}</div>
            </Popover>
          }>
          <li onClick={this.props.onClick} data-consumer={d.id}>
            <span className="side-widget-list-item">{d.id}</span>
            <span className="pull-right">{value+suffix}</span>
          </li>
        </OverlayTrigger>;
      })}
    </ul>;
  }
}

export {
  C_Producers,
  C_Consumers,
  C_Consumer_Clients
};
