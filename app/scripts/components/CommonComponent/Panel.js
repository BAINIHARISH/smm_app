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
import {Link} from 'react-router';
import {Panel, PanelGroup,Tabs, Tab,OverlayTrigger, Popover, DropdownButton, Collapse,
  Checkbox
} from 'react-bootstrap';
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';
import { toastOpt, unknownAccessCode, updateBaseUrl ,updateRestUrl } from '../../utils/Constants';
import FSReactToastr from './FSReactToastr' ;
import CommonNotification from '../../utils/CommonNotification';
import MetricNotification from './MetricNotification';
import Utils from '../../utils/Utils';
import {Scrollbars} from 'react-custom-scrollbars';
import {C_Producers,C_Consumers} from './ProducerConsumerList';

Collapse.defaultProps.timeout = 0;
const showNumberOfPartitions = 10;

const getMessageString = (messagesInCount) => {
  let {value,suffix} = Utils.abbreviateNumber(messagesInCount);
  let messagesInCountStr = '';
  if(!suffix){
    messagesInCountStr = parseInt(value);
  }else{
    messagesInCountStr = (value+''+suffix);
  }
  return messagesInCountStr;
};

const getPartitionProgressValue = (partitionCount, topicCount) => {
  if(topicCount == 0){
    return 0;
  }
  const progressOut = (partitionCount*100)/topicCount;
  return (progressOut > 100 ? 100 : progressOut);
};

class ProgressBar extends Component{
  constructor(props){
    super(props);
  }
  render(){
    const {patitionStatus,progressOut = 0,progressIn = 0, partition,partitionClick,bytesInOutObj,patitionPanelClick} = this.props;
    return (
      <div className="multi-subgroup" onClick={patitionPanelClick}>
        {
        [<div key={`partition-patitionStatus`} className="partition">
            {partition}&nbsp;&nbsp;
          </div>,
          <div key={`partition-progressIn`} className="bar1">
            <div className={`progress-baar ${patitionStatus} clearfix`} style={{width: '100%'}}>
              <div className={`bar-transparent`} style={{width: `${progressIn}%`}}></div>
                <div className="progress-text">
                  <div className="pull-left bytesIn">
                    <span title={`Partition Data In: ${bytesInOutObj.bytesInCount.toLocaleString()}`}>
                      {Utils.bytesToSize(bytesInOutObj.bytesInCount)} in
                    </span>
                  </div>
                </div>
            </div>
          </div>,
          <div key={`partition-progressOut`} className="bar2">
            <div className={`progress-baar ${patitionStatus} clearfix`} style={{width: '100%'}}>
              <div className={`bar-base`} style={{width: `${progressOut}%`}}></div>
                <div className="progress-text">
                  <div className="pull-left bytesOut">
                    <span title={`Partition Data Out: ${bytesInOutObj.bytesOutCount.toLocaleString()}`}>
                      {Utils.bytesToSize(bytesInOutObj.bytesOutCount)} out
                    </span>
                  </div>
                </div>
            </div>
          </div>]
        }
      </div>
    );
  }
}

ProgressBar.defaultProps = {
  bytesInOutObj:{
    bytesInCount:0,
    bytesOutCount:0
  }
};

class ProgressBarPanel extends Component{
  constructor(props){
    super(props);
    this.state = {
    };
  }
  onPartitionClick(partition){}
  onSelectedClick = () => {
    const {partitionClick,topicName,partitionCount,partitions} = this.props;
    const partitionData = partitions[0];
    const obj = {
      partition : partitionData.partitionInfo.partition,
      topic : topicName,
      dataIn: partitionData.bytesInCount,
      dataOut: partitionData.bytesOutCount,
      showAllPartitionsBtn: partitionCount > 1 ? true : false
    };
    partitionClick(obj);
  }

  getFollowerReplicaPill(r, isr){

    const isISR = _.find(isr, (_isr) => {
      return _isr.id == r.id;
    });

    let statusClass = 'teal';
    let title = `In Sync Replica (Broker: ${r.id})`;
    if(!isISR){
      statusClass = 'red';
      title = `Not In Sync Replica (Broker: ${r.id})`;
    }

    return <div
      key={r.id}
      className={`priority-pill ${statusClass}`}
      style={{float: 'none', display: 'inline-block'}}
      title={title}
    >
      {r.id}
    </div>;
  }

  getFollowerReplicasComp(){
    const {partitions} = this.props;
    const partitionData = partitions[0];
    let Comp = null;

    const leader = partitionData.partitionInfo.leader;

    const replicas = _.filter(partitionData.partitionInfo.replicas, (r) => {
      return r.id != leader.id;
    });
    const isr = _.filter(partitionData.partitionInfo.isr, (i) => {
      return i.id != leader.id;
    });


    if(replicas.length > 2){
      const dropDownTitle = <span title="Follower Replicas">{replicas.length}</span>;

      let statusClass = 'teal';
      if(replicas.length != isr.length){
        statusClass = 'red';
      }
      Comp = <DropdownButton
        className={`priority-pill-btn ${statusClass}`}
        pullRight
          bsStyle="default pull-right"
          title={dropDownTitle}
          noCaret
          id="partition-pill-dropdown"
        >
          <div>
            <Scrollbars
              autoHide
              autoHeight
              autoHeightMin={30}
              autoHeightMax={100}
              renderThumbHorizontal={props => <div {...props} style={{ display: "none" }}/>}
            >
            {_.map(replicas, (r) => {
              return this.getFollowerReplicaPill(r, isr);
            })}
            </Scrollbars>
          </div>
        </DropdownButton>;
    }else{
      Comp = _.map(replicas, (r) => {
        return this.getFollowerReplicaPill(r, isr);
      });
    }

    return Comp;
  }

  getHeader(){
    const {viewType, brokerId, partitions,topicName,panelType} = this.props;
    const partitionData = partitions[0];
    const partition = 'P'+partitionData.partitionInfo.partition;
    let selectedPartitionMetrics,bytesInOutObj={bytesInCount:0,bytesOutCount:0},progressOut = 0,progressIn=0;
    if(partitionData){
      bytesInOutObj.bytesInCount = partitionData.bytesInCount;
      bytesInOutObj.bytesOutCount = partitionData.bytesOutCount;
      progressOut = getPartitionProgressValue(partitionData.bytesOutCount, partitionData.topic.bytesOutCount);
      progressIn = getPartitionProgressValue(partitionData.bytesInCount, partitionData.topic.bytesInCount);
    }

    let widget,widgetTitle,pillHiddenClass='',tooltipText='';
    switch(panelType){
    case 'topic':
      widget = 'topic_name';
      widgetTitle = brokerId;
      tooltipText = brokerId;
      break;
    case 'broker' :
      widget = 'broker_name';
      widgetTitle = topicName;
      tooltipText = topicName;
      pillHiddenClass = 'priority-pill-hidden';
      break;
    case 'producer':
      widget = 'producer_name';
      widgetTitle = <span>{brokerId}&nbsp;&nbsp;&nbsp;{topicName}</span>;
      tooltipText = brokerId + ' : ' +topicName;
      pillHiddenClass = 'priority-pill-hidden';
      break;
    case 'consumer':
      widget = 'consumer_name';
      widgetTitle =  <span>{brokerId}&nbsp;&nbsp;&nbsp;{topicName}</span>;
      tooltipText = brokerId + ' : ' +topicName;
      pillHiddenClass = 'priority-pill-hidden';
      break;
    default: widget = 'topic_name';
      break;
    };

    return (
      <div>
        <span className={`hb xs success status-icon`}><i className={'fa fa-check'}></i></span>
        <div className="row">
          <div className={`multi-widget ${widget}`}>
            <div className="multi-cell name">
              <div className="progress-baar-topic" title={tooltipText}>&nbsp;{widgetTitle}</div>
            </div>
            <ProgressBar bytesInOutObj={bytesInOutObj} partition={partition} patitionStatus={this.props.patitionStatus} progressOut={progressOut} progressIn={progressIn}  patitionPanelClick={this.onSelectedClick}/>
            <div className={`multi-cell boxes text-right ${pillHiddenClass}`}>
              {
                viewType !== "consumers"
                ? this.getFollowerReplicasComp()
                : null
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
  render(){
    const {topicName,partitions,brokerId} = this.props;
    const dataAttr = {};
    if(brokerId){
      dataAttr['data-b'+brokerId] = '';
    }
    if(topicName){
      dataAttr['data-topicname'] = topicName;
    }
    if(partitions){
      _.each(partitions, (p) => {
        dataAttr['data-b-p'+p.partitionInfo.partition] = '';
      });
    }
    return <Panel
      header={this.getHeader()}
      headerRole="tabpanel"
      {...dataAttr}
    >
    </Panel>;
  }
}

ProgressBarPanel.defaultProps = {
  partitionClick: () => { }
};

class C_Panel extends Component {
  constructor(props) {
    super(props);
  }
  getHeader(){
    return null;
  }
  handlePanelClick = (eventKey) => {
    this.props.handleSelect(eventKey);
  }
  render() {
    const {handleSelect,eventKey,activeKey,activePanelPool,expanded} = this.props;
    return (
      <Panel
        className="sticky-header"
        header={this.getHeader()}
        headerRole="tabpanel"
        collapsible
        expanded = {expanded}
        eventKey={eventKey}
      >
        {expanded ? this.getContent() : null}
      </Panel>
    );
  }
}

C_Panel.defaultProps = {
  viewType: 'Listing'
};

C_Panel.contextTypes = {
  router: PropTypes.object.isRequired,
  App: PropTypes.object
};

class C_PanelGroup extends Component {
  render(){
    const {data,panelProps} = this.props;
    const Panel_ = this.Panel;
    return <PanelGroup
      bsClass={panelProps.showProducerConsumer ? "panel-cust topic-panel" : "panel-cust"}
      role="tablist"
      activeKey={panelProps.activeKey}
    >
      {_.map(data, (d, i) => {
        let id = '';
        if(d.name){
          id = d.name;
        } else if(d.node){
          id = d.node.id;
        }else if(d.clientId){
          id = d.clientId;
        }else{
          id = d.consumerGroupInfo.id;
        }
        return <Panel_  eventKey={id} key={id+''+i} data={d} {...panelProps} expanded={_.findIndex(panelProps.activePanelPool, (p) => p === id) !== -1 ? true : false} />;
      })}
    </PanelGroup>;
  }
}

class SelectPartitionComponent extends Component{
  constructor(props){
    super(props);
    this.state = {
      searchValue: '',
      open: false
    };
  }
  getFilteredData(){
    const {partitionMetrics} = this.props;
    const {searchValue} = this.state;
    let filteredData = [];
    _.each(partitionMetrics, (partitionMetric, partition) => {
      let matchFilter = new RegExp(searchValue, 'i');
      if(searchValue == ''){
        filteredData.push(partitionMetric);
      }else if(matchFilter.test('P'+partition)){
        filteredData.push(partitionMetric);
      }
    });
    return filteredData;
  }
  handleSearch = (e) => {
    this.setState({searchValue: e.target.value.trim()});
  }
  handleSelectPartition(p){
    const {selectedPartitions, onSelectPartition} = this.props;
    const partitionInfo = p.aggrTopicPartitionMetrics.partitionInfo;
    const partition = partitionInfo.partition.toString();
    const indexOf = selectedPartitions.indexOf(partition);
    if(indexOf == -1){
      selectedPartitions.push(partition);
    }else{
      selectedPartitions.splice(indexOf, 1);
    }
    onSelectPartition(selectedPartitions);
  }
  handleSelectAll = (e) => {
    const {onSelectPartition} = this.props;
    let selectedPartitions = [];

    const filteredEntities = this.getFilteredData();

    if(e.target.checked){
      _.each(filteredEntities, (p) => {
        const partitionInfo = p.aggrTopicPartitionMetrics.partitionInfo;
        const partition = partitionInfo.partition.toString();
        selectedPartitions.push(partition);
      });
    }

    onSelectPartition(selectedPartitions);
  }
  getDropDownContent(){
    const {selectedPartitions} = this.props;
    const {searchValue} = this.state;
    const filteredEntities = this.getFilteredData();

    const selectAll = _.filter(filteredEntities, (p)=>{
      const partitionInfo = p.aggrTopicPartitionMetrics.partitionInfo;
      const partition = partitionInfo.partition.toString();
      return selectedPartitions.indexOf(partition) > -1;
    }).length == filteredEntities.length;;

    return <div role="menu">
      <div  className="list-container select-partition-container">
        <div className="search-bar" style={{marginBottom: '10px'}}>
          <span className="input-group">
            <input type="text" placeholder="Search" className="form-control" onChange={this.handleSearch} value={searchValue} />
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
          <table className="table table-condensed no-margin-bottom">
              <thead>
                <tr>
                  <th>
                    <Checkbox inline checked={selectAll} onChange={this.handleSelectAll}>Name</Checkbox>
                  </th>
                  <th className="text-right">
                    <label className="checkbox-inline">Data Out</label>
                  </th>
                </tr>
              </thead>
              <tbody>
                {
                filteredEntities.map((p, i)=>{
                  const partitionInfo = p.aggrTopicPartitionMetrics.partitionInfo;
                  const partition = partitionInfo.partition.toString();
                  return(
                    <tr key={i} className="list-item">
                    <td>
                      <Checkbox inline
                        checked={selectedPartitions.indexOf(partition) > -1 ? true : false}
                        onChange={this.handleSelectPartition.bind(this, p)}
                      >
                        P{partition}
                      </Checkbox>
                    </td>
                    <td className="text-right">
                      <label>{Utils.bytesToSize(p.aggrTopicPartitionMetrics.bytesOutCount)}</label>
                    </td>
                  </tr>
                  );})
                }
              </tbody>
          </table>
          <hr />
        </div>
        </Scrollbars>
        }
      </div>
      </div>;
  }
  getSelectPartitionDropDown(){
    const {data} = this.props;
    const {selectedPartitions, open} = this.state;

    const DropDown = <div className="partition-dropdown"><DropdownButton
      style={{color: '#288ec2'}}
      dropup
      open={open}
      onClick={this.toggleDropDown}
        bsStyle="default "
        title={"Select Partitions"}
        id="select-partitions-dropdown"
      >
        <RootCloseWrapper
          disabled={!open}
          onRootClose={()=>{
            this.setState({open: false});
          }}
          event='click'
        >
          {this.getDropDownContent()}
        </RootCloseWrapper>
      </DropdownButton>
    </div>;
    return DropDown;
  }
  toggleDropDown = () => {
    const {open} = this.state;
    this.setState({open: !open});
  }
  render(){
    return this.getSelectPartitionDropDown();
  }
}

class TopicDetails extends Component{
  constructor(props){
    super(props);
    const partitionNumbers = _.keys(props.data.partitionMetrics);
    this.state = {
      partitionCount: partitionNumbers.length
    };
  }
  getSelectedPartitions(){
    const {data,selectedPartitions} = this.props;
    const partitions = [];
    _.each(data.partitionMetrics, (partitionMetric, partition) =>{
      if(selectedPartitions.indexOf(partition) > -1){
        partitions.push(partitionMetric);
      }
    });
    return partitions;
  }
  getInSyncReplicas(){
    const {data} = this.props;
    let isr = 0, replicas=0;
    _.each(data.partitionMetrics, (p) => {
      isr += p.aggrTopicPartitionMetrics.partitionInfo.isr.length;
      replicas += p.aggrTopicPartitionMetrics.partitionInfo.replicas.length;
    });
    return {isr, replicas};
  }
  getBrokers(){
    const {data} = this.props;
    const groupByBrokerId = _.groupBy(data.partitionMetrics, (d) => {
      return d.aggrTopicPartitionMetrics.partitionInfo.leader.id;
    });
    return groupByBrokerId;
  }
  render(){
    const {data,handlePartitionClick, viewType, selectedPartitions, onSelectPartition} = this.props;
    const {partitionCount} = this.state;
    const Brokers = this.getBrokers();
    const sr = this.getInSyncReplicas();
    const {metrics = {}} = data;

    let partitions = [];
    if(viewType == 'Listing'){
      partitions = this.getSelectedPartitions();
    }else{
      partitions = _.map(data.partitionMetrics, (pm) => {
        return pm;
      });
    }
    const retentionPeriod = Utils.getTimeString(data.retentionMs);

    return(
      <div className="topic-details">
        <label className="topic-metric-label">Replication Factor: <span>({!_.isEmpty(data.partitionMetrics) ? data.partitionMetrics["0"].aggrTopicPartitionMetrics.partitionInfo.replicas.length : 0})</span></label>
        <label className="topic-metric-label">InSync Replicas: <span>{sr.isr} Of {sr.replicas}</span></label>
        <label className="topic-metric-label">Total messages: <span>{data.messagesInCount.toLocaleString()}</span></label>
        <label className="topic-metric-label">Retention Period: <span>{retentionPeriod}</span></label>
        {
          _.map(partitions, (partition) => {
            const partitionMetrics = partition.aggrTopicPartitionMetrics;
            const brokerId = partitionMetrics.partitionInfo.leader.id;
            const partitionNumber = partitionMetrics.partitionInfo.partition;
            return <ProgressBarPanel panelType="topic" partitions={[partitionMetrics]} partitionClick={handlePartitionClick} topicName={data.name} key={brokerId+''+partitionNumber} brokerId={brokerId} patitionStatus={"blue"}
              partitionCount={partitions.length}
            />;
          })
        }

        {partitionCount > showNumberOfPartitions && viewType == 'Listing' ?
          <div style={{textAlign: 'center'}}>
            <SelectPartitionComponent
              selectedPartitions={selectedPartitions}
              partitionMetrics={data.partitionMetrics}
              onSelectPartition={onSelectPartition}
            />
          </div>
        : null }

        {/*<MetricNotification title="Recommended Re-Partition" timeVal={2547} status="warning">
          <Link to="/">other events</Link> dolor sit amet, consecteturing detri...
        </MetricNotification>
        <MetricNotification title="Recommended Re-Partition" timeVal={2547} status="danger">
          <Link to="/">other events</Link> dolor sit amet, consecteturing detri...
        </MetricNotification>*/}
      </div>
    );
  }
}

TopicDetails.defaultProps = {
  viewType: 'Listing'
};

class TopicPanel extends C_Panel{
  constructor(props){
    super(props);
    const partitionNumbers = _.keys(props.data.partitionMetrics);
    let selectedPartitions;
    if(props.viewType == 'Listing'){
      selectedPartitions = partitionNumbers.slice(0, showNumberOfPartitions);
    }else{
      selectedPartitions = partitionNumbers;
    }
    this.state = {
      selectedPartitions: selectedPartitions
    };
  }
  navigateToDetail = () => {
    const {data} = this.props;
    const {router} = this.context;
    router.push({
      pathname : '/topics/'+data.name,
      state : {
        topicName : data.name
      }
    });
  }

  showTopicDataExplorer = (evt) => {
    this.props.showTopicModal(evt);
  }

  getHeader(){
    const {App} = this.context;
    const {selectedCluster, grafanaUrl, atlasUrl} = App.state;
    const {data,eventKey,activePanelPool,expanded} = this.props;
    const {metrics = {}} = data;

    return <div onClick={() => this.handlePanelClick(eventKey)}>
      <span className={`hb success status-icon`}><i className={'fa fa-check'}></i></span>
      <div className="panel-table">
        <div className="panel-sections first">
          <h4 className={data.topicSummary.internal ? "schema-th internal-topic-label" : "schema-th"} title={data.name}>{data.name}</h4>
          {/*<h6 className={`schema-td font-green-color`}>{'RECOMMENDATION'}</h6>*/}
        </div>
        <div className="panel-sections">
          <h4 className={`schema-td font-blue-color`} title={data.bytesInCount.toLocaleString()}>{Utils.bytesToSize(data.bytesInCount)}</h4>
        </div>
        <div className="panel-sections">
          <h4 className={`schema-td font-blue-color`} title={data.bytesOutCount.toLocaleString()}>{Utils.bytesToSize(data.bytesOutCount)}</h4>
        </div>
        <div className="panel-sections">
          <h4 className={`schema-td font-blue-color`} title={data.messagesInCount.toLocaleString()}>{getMessageString(data.messagesInCount)}</h4>
        </div>
        {/*<div className="panel-sections">
          <h4 className={`schema-td font-blue-color`} title={_.keys(data.partitionMetrics).length}>{_.keys(data.partitionMetrics).length}</h4>
        </div>*/}
        <div className="panel-sections  column-18">
          <h4 className={`schema-td font-blue-color`} title={data.consumerGroupsCount}>{data.consumerGroupsCount}</h4>
        </div>
        <div className="panel-sections panel-actions">
          <div>
            <div>
              <img title="Grafana" className="icon-image" onClick={(evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                if(grafanaUrl){
                  const topicName = data.name;
                  const url = Utils.getGrafanaTopicUrl(grafanaUrl, topicName);
                  window.open(url);
                }else{
                  FSReactToastr.error(<CommonNotification flag="error" content={'Grafana url not found'}/>, '', toastOpt);
                }
              }} width="16" height="16" src="styles/img/grafana-logo.png"/>
            </div>
            <div>
              <i className="fa fa-globe" data-name={data.name} onClick={(evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                if(atlasUrl){
                  const topicName = data.name;
                  const url = Utils.getAtlasTopicUrl(atlasUrl, topicName);
                  window.open(url);
                }else{
                  FSReactToastr.error(<CommonNotification flag="error" content={'Atlas url not found'}/>, '', toastOpt);
                }
              }} title="Atlas"></i>
            </div>
            <div>
              <i className="fa fa-search" data-name={data.name} onClick={this.showTopicDataExplorer} title="Data Explorer"></i>
            </div>
            <div>
              <i className="fa fa-list-alt" onClick={this.navigateToDetail} title="Profile"></i>
            </div>
          </div>
        </div>
        <div className="panel-sections panel-angle">
        {
          expanded ?
          <i className="fa fa-angle-up"></i>
          : <i className="fa fa-angle-down"></i>
        }
        </div>
      </div>
    </div>;
  }
  onSelectPartition = (selectedPartitions) => {
    this.setState({selectedPartitions: selectedPartitions});
  }
  getContent(){
    return (this.props.showProducerConsumer ?
      <div className="topic-panel-details"><TopicDetails2 {...this.props} onSelectPartition={this.onSelectPartition} selectedPartitions={this.state.selectedPartitions} /></div>
      : <TopicDetails {...this.props} onSelectPartition={this.onSelectPartition} selectedPartitions={this.state.selectedPartitions} />);
  }
}

class TopicPanelGroup extends C_PanelGroup{
  get Panel(){
    return TopicPanel;
  }
}

class TopicDetails2 extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {data} = this.props;
    return (
      <div className="flexbox-container">
      <C_Producers data={data.producers}/>
      <div className="col-md-8 flex-col-8">
        <TopicDetails {...this.props} />
      </div>
      <C_Consumers data={data.consumers}/>
      </div>
    );
  }
}


class PercentageBar extends Component {
  constructor(props){
    super(props);
  }
  render() {
    let {title, currentPercentage,status} = this.props;
    if(currentPercentage > 100) {currentPercentage = 100;}
    return (
      <div className="percentage-widget">
        {title ? <div className="percentage-title" title={title}>{title}</div> : null}
        <div className="percentage-box">
          <div className={`percentage-bar`}>
            <div className="bg">
              <div className={`fg ${status}`} style={{width: `${currentPercentage}%`}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class BrokerDetails extends Component{
  onPartitionClick = () => {}
  render(){
    const {data, handlePartitionClick} = this.props;
    return(
      <div className="panel-cust-body broker-panel">
      <div className="row">
        <label className="broker-metric-label" title={data.memFreePercent}>Free Memory <div style={{display: 'inline-block', width: '80px', height: '8px'}}><PercentageBar currentPercentage={data.memFreePercent} title="" /></div></label>
        <label className="broker-metric-label" title={data.diskPercent}>Free Disk <div style={{display: 'inline-block', width: '80px', height: '8px'}}><PercentageBar currentPercentage={data.diskPercent} title="" /></div></label>
        <label className="broker-metric-label" title={data.cpuIdle.toFixed(2)}>CPU Idle <span>{data.cpuIdle.toFixed(2)}</span></label>
        <label className="broker-metric-label" title={data.loadAvg.toFixed(2)}>Load Average <span>{data.loadAvg.toFixed(2)}</span></label>
        <label className="broker-metric-label" title={data.diskIo.toFixed(2)}>Disk I/O <span>{data.diskIo.toFixed(2)}</span></label>
      </div>
      {_.map(data.partitions, (partitionMetrics,i) => {
        // let bytesInOutObj={bytesInCount:0,bytesOutCount:0},progressOut=0,progressIn=0;

        // if(partitionMetrics){
        //   /*bytesInOutObj.bytesInCount = Utils.getHighestTimestampValue(partition.detail.metrics.bytesInCount);
        //   bytesInOutObj.bytesOutCount = Utils.getHighestTimestampValue(partition.detail.metrics.bytesOutCount);
        //   const topicHighestBytesCount = Utils.getHighestTimestampValue(partition.detail.topicMetrics.bytesOutCount);
        //   bytesInOutObj.topicBytesOut = topicHighestBytesCount;*/
        //   bytesInOutObj.bytesInCount = partitionMetrics.detail.bytesInCount;
        //   bytesInOutObj.bytesOutCount = partitionMetrics.detail.bytesOutCount;
        //   progressOut = getPartitionProgressValue(bytesInOutObj.bytesOutCount, partitionMetrics.topic.bytesOutCount);
        //   progressIn = getPartitionProgressValue(bytesInOutObj.bytesInCount, partitionMetrics.topic.bytesInCount);
        // }

        // const dataAttr = {};
        const topicName = partitionMetrics.topic.name;
        const partition = partitionMetrics.detail.partitionInfo.partition;
        const brokerId = partitionMetrics.detail.partitionInfo.leader.id;
        const dataIn = partitionMetrics.detail.bytesInCount;
        const dataOut = partitionMetrics.detail.bytesOutCount;
        // if(topicName){
        //   dataAttr['data-topicname'] = topicName;
        // }
        // if(partition !== undefined){
        //   dataAttr['data-b-p'+partition] = '';
        // }

        return  <ProgressBarPanel
                  partitionClick={(handlePartitionClick || this.onPartitionClick).bind(this, {topic:topicName,partition:partition,dataIn: dataIn,dataOut: dataOut})}
                  key={`${topicName}-${partition}-${i}`}
                  topicName={topicName}
                  partitions={[partitionMetrics.detail]}
                  title={topicName}
                  brokerId={brokerId}
                  viewType="consumers"
                  panelType="broker"
                  patitionStatus={"blue"}/>;

        // return <div key={i} style={{position:"relative"}} {...dataAttr} onClick={(handlePartitionClick || this.onPartitionClick).bind(this, {topic:topicName,partition:partition})}>
        //   <ProgressBar bytesInOutObj={bytesInOutObj} patitionStatus={"blue"} progressOut={progressOut} progressIn={progressIn} title={partitionMetrics.topic.name+'-P'+partitionMetrics.detail.partitionInfo.partition}/>
        // </div>;
      })}
      {/*<MetricNotification title="Recommended Re-Partition" timeVal={2547} status="warning">
        <Link to="/">other events</Link> dolor sit amet, consecteturing detri...
      </MetricNotification>*/}
      </div>
    );
  }
}

class BrokerDetails2 extends Component{
  onPartitionClick = () => {}
  render(){
    const {data, handlePartitionClick} = this.props;
    return(
      <div className="topic-details zIndex20">
        <div className="row">
          <label className="broker-metric-label details">InSync Replicas: <span>{data.totalNumInSyncReplicas} Of {data.totalNumReplicas}</span></label>
          <label className="broker-metric-label details">Total Messages: <span>{data.totalMessages.toLocaleString()}</span></label>
          <label className="broker-metric-label details">Retention Period: <span>{data.logRetentionPeriodValue.toLocaleString()+' '+data.logRetentionPeriodTimeUnit}</span></label>
        </div>
        {_.map(data.topicLeaderPartitionInfos, (partition,i) => {
          const topicName = partition.topicName;
          const partitionId = partition.partitionId;
          const bytesInOutObj =  {
            bytesInCount: partition.bytesInCount,
            bytesOutCount: partition.bytesOutCount
          };

          const partitionMetrics = {
            bytesOutCount: partition.bytesOutCount,
            bytesInCount: partition.bytesInCount,
            partitionInfo: {
              partition: partitionId
            },
            topic: {
              bytesInCount: partition.totalTopicBytesInCount,
              bytesOutCount: partition.totalTopicBytesOutCount
            }
          };

          return  <ProgressBarPanel
            key={`${topicName}-${partitionId}-${i}`}
            topicName={topicName}
            partitions={[partitionMetrics]}
            title={topicName}
            viewType="consumers"
            panelType="broker"
            patitionStatus={"blue"}/>;
        })}
      </div>
    );
  }
}

class BrokerPanel extends C_Panel{
  navigateToDetail = () => {
    const {data} = this.props;
    const {router} = this.context;
    router.push({
      pathname : '/brokers/'+data.node.id,
      state : {
        brokerid : data.node.id,
        brokerHost: data.node.host
      }
    });
  }
  getHeader(){
    const {App} = this.context;
    const {selectedCluster, grafanaUrl, atlasUrl} = App.state;
    const {data,eventKey,activePanelPool,expanded} = this.props;
    const {partitions=[],replicas=[]} = data;
    const hostPortArr = [data.node.host];
    if(data.node.port){
      hostPortArr.push(data.node.port);
    }
    const {metrics = {}} = data;
    // let bytesInCount= Utils.getHighestTimestampValue(metrics.bytesInCountPerSec),
    //   bytesOutCount= Utils.getHighestTimestampValue(metrics.bytesOutCountPerSec),
    //   messagesInCount= Utils.getHighestTimestampValue(metrics.messagesInCountPerSec);
    return <div key={eventKey} onClick={() => this.handlePanelClick(eventKey)}>
      <span className={`hb success status-icon`}><i className={'fa fa-check'}></i></span>
      <div className="panel-table">
        <div className="panel-sections first">
          <h4 className="schema-th">{data.node.id}</h4>
          <h6 className={`schema-td`} title={hostPortArr.join(':')}>{hostPortArr.join(':')}</h6>
        </div>
        {/*<div className="panel-sections">
          <h6 className="schema-th">
            <OverlayTrigger trigger={['hover']} placement="top" overlay={<Popover id="popover-trigger-hover">Bytes In Count Per Second</Popover>}>
              <span>BYTES IN</span>
            </OverlayTrigger>
          </h6>
          <h4 className={`schema-td font-blue-color`}>{Utils.bytesToSize(bytesInCount)}</h4>
        </div>
        <div className="panel-sections">
          <h6 className="schema-th">
            <OverlayTrigger trigger={['hover']} placement="top" overlay={<Popover id="popover-trigger-hover">Bytes Out Count Per Second</Popover>}>
              <span>BYTES OUT</span>
            </OverlayTrigger>
          </h6>
          <h4 className={`schema-td font-blue-color`}>{Utils.bytesToSize(bytesOutCount)}</h4>
        </div>*/}
        <div className="panel-sections">
          <h4 className={`schema-td font-blue-color`} title={data.throughput.toLocaleString()}>{Utils.bytesToSize(data.throughput)}</h4>
        </div>
        <div className="panel-sections">
          <h4 className={`schema-td font-blue-color`} title={data.messageIn.toLocaleString()}>{getMessageString(data.messageIn)}</h4>
        </div>
        <div className="panel-sections">
          <h4 className={`schema-td font-blue-color`} title={partitions.length}>{partitions.length}</h4>
        </div>
        <div className="panel-sections">
          <h4 className={`schema-td font-blue-color`} title={replicas.length}>{replicas.length}</h4>
        </div>
        <div className="panel-sections panel-actions">
          <div>
            <div>
              <img title="Grafana" onClick={(evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                if(grafanaUrl){
                  const brokerHost = data.node.host;
                  const url = Utils.getGrafanaBrokerUrl(grafanaUrl, brokerHost);
                  window.open(url);
                }else{
                  FSReactToastr.error(<CommonNotification flag="error" content={'Grafana url not found'}/>, '', toastOpt);
                }
              }} className="icon-image" width="16" height="16" src="styles/img/grafana-logo.png"/>
            </div>
            <div>
              <img title="Ambari" onClick={(evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                const ambariUrl = selectedCluster.ambariUrl;
                if(ambariUrl){
                  const brokerHost = data.node.host;
                  const url = Utils.getAmbariBrokerUrl(ambariUrl, brokerHost);
                  window.open(url);
                }else{
                  FSReactToastr.error(<CommonNotification flag="error" content={'Ambari url not found'}/>, '', toastOpt);
                }
              }} className="icon-image" width="16" height="16" src="styles/img/ambari-logo.png"/>
            </div>
            <div>
              <i className="fa fa-list-alt" onClick={this.navigateToDetail} title="Profile"></i>
            </div>
          </div>
        </div>
        <div className="panel-sections panel-angle">
        {
          expanded ?
          <i className="fa fa-angle-up"></i>
          : <i className="fa fa-angle-down"></i>
        }
      </div>
      </div>
    </div>;
  }
  getContent(){
    return <BrokerDetails {...this.props}/>;
  }
}

class BrokerPanelGroup extends C_PanelGroup{
  get Panel(){
    return BrokerPanel;
  }
  render(){
    return super.render();
  }
}

class ProducerDetails extends Component{
  render(){
    const {data, topics} = this.props;
    let topicCount = 0, partitionCount = 0;
    const ProgressBarPanels = [];
    const _topics = _.map(data.wrappedPartitionMetrics, (topic, topicName) => {
      topicCount++;
      let topicMetrics = {
        bytesOutCount: 0,
        bytesInCount: 0,
        messagesInCount: 0
      };
      _.each(topic, (p, partitionName)=>{
        if(p.partitionMetrics == null){
          return;
        }
        topicMetrics.bytesOutCount += p.partitionMetrics.bytesOutCount;
        topicMetrics.bytesInCount += p.partitionMetrics.bytesInCount;
        topicMetrics.messagesInCount += p.partitionMetrics.messagesInCount;
      });
      _.each(topic, (p, partitionName) =>{
        if(p.partitionMetrics == null){
          return ;
        }
        partitionCount++;
        // let obj = {
        //   partition: partitionName,
        //   metrics: p.partitionMetrics,
        //   topic: topicMetrics
        // };
        let obj = p.partitionMetrics;
        obj.topic = topicMetrics;
        let brokerId = p.partitionMetrics.partitionInfo.leader.id;
        ProgressBarPanels.push(
          <ProgressBarPanel patitionStatus={"blue"} progressStatus={96}
            key={topicName+'-P'+partitionName}
            brokerId={brokerId}
            partitions={[obj]}
            topicName={topicName}
            panelType="producer"
            title={topicName+'-P'+partitionName}
            viewType="consumers"/>
        );
      });
    });

    return(
      <div className="topic-details zIndex20">
        <label className="topic-metric-label">Topics ({topicCount})</label>
        <label className="topic-metric-label">Partitions ({partitionCount})</label>
        {
          ProgressBarPanels
        }
      </div>
    );
  }
}

class ProducerPanel extends C_Panel{
  navigateToDetail = () => {
    const {data} = this.props;
    const {router} = this.context;
    router.push('/producers/'+ data.clientId);
  }
  getHeader(){
    const {eventKey, data, activePanelPool,expanded} = this.props;
    let messagesCount = 0;
    _.each(data.partitionToInMessageCount, (val) => {
      messagesCount += val;
    });
    // messagesCount = parseInt(messagesCount);
    let {value, suffix} = Utils.abbreviateNumber(messagesCount);

    return <div onClick={() => this.handlePanelClick(eventKey)}>
      <span className={`hb success status-icon`}><i className={'fa fa-check'}></i></span>
      <div className="panel-table">
        <div className="panel-sections first">
          <h4 className="schema-th weight-400" title={data.clientId}>{data.clientId}</h4>
          <h6 className={`schema-td font-green-color`} title={data.active ? 'ACTIVE' : 'INACTIVE'}>{data.active ? 'ACTIVE' : 'INACTIVE'}</h6>
        </div>
        <div className="panel-sections">
          <h4 className={`schema-td font-blue-color`} title={messagesCount.toLocaleString()}>{value+suffix}</h4>
        </div>
        {/*<div className="panel-sections">
          <h6 className="schema-th">LATENCY</h6>
          <h4 className={`schema-td font-blue-color`}>{'1.64ms'}</h4>
        </div>
        <div className="panel-sections">
          <h6 className="schema-th">CONNECTIONS </h6>
          <h4 className={`schema-td font-blue-color`}>{2}</h4>
        </div>*/}
        <div className="panel-sections panel-actions">
          <div><i className="fa fa-list-alt" onClick={this.navigateToDetail} title="Profile"></i></div>
        </div>
        <div className="panel-sections panel-angle">
        {
          expanded ?
          <i className="fa fa-angle-up"></i>
          : <i className="fa fa-angle-down"></i>
        }
      </div>
      </div>
    </div>;
  }
  getContent(){
    return <div className="panel-cust-body">
      <ProducerDetails {...this.props}/>
    </div>;
  }
}

class ProducerPanelGroup extends C_PanelGroup{
  get Panel(){
    return ProducerPanel;
  }
}

class ConsumerDetails extends Component{
  render(){
    const {data,topics,panelProps} = this.props;
    let topicArr = topics;
    if(panelProps){
      topicArr = panelProps.topics;
    }
    return(
      <div className="topic-details zIndex20">
        <label className="topic-metric-label">Partitions ({data.topicPartitions ? data.topicPartitions.length : 0})</label>
        {
          _.map(data.topicPartitions, (p) => {
            let obj={};
            const topic = _.find(topicArr, (t) => t.name === p.topic);
            if(!!topic){
              obj = _.find(topic.partitions,(tp) =>  tp.partition === p.partition);
            }
            const brokerId = obj.leader ? obj.leader.id : '';
            return <ProgressBarPanel patitionStatus={"blue"} progressStatus={96}
              brokerId={brokerId}
              partitions={[obj]}
              topicName={topic.name}
              title={p.topic+'-P'+p.partition}
              viewType="consumers"/>;
          })
        }
        {/*<ProgressBarPanel patitionStatus={"blue"} progressStatus={90} brokerId={1000} partitions={[{partition:0}]} viewType="consumers"/>
        <ProgressBarPanel patitionStatus={"blue"} progressStatus={96} brokerId={1001} partitions={[{partition:0}]} viewType="consumers"/>
        <ProgressBarPanel patitionStatus={"blue"} progressStatus={92} brokerId={1002} partitions={[{partition:0}]} viewType="consumers"/>*/}
        {/*<MetricNotification title="Recommended Re-Partition" timeVal={2547} status="danger">
          <Link to="/">other events</Link> dolor sit amet, consecteturing detri...
        </MetricNotification>*/}
      </div>
    );
  }
}

class ConsumerDetails2 extends Component{
  render(){
    const {data,topics,panelProps} = this.props;
    let topicArr = topics;
    if(panelProps){
      topicArr = panelProps.topics;
    }
    const ProgressBarPanels = [];
    _.map(data.wrappedPartitionMetrics, (topics, topicName)=> {
      let topicMetrics = {
        bytesOutCount: 0,
        bytesInCount: 0,
        messagesInCount: 0
      };
      _.map(topics, (p, key)=>{
        const metrics = p.partitionMetrics || {};
        topicMetrics.bytesOutCount += metrics.bytesOutCount;
        topicMetrics.bytesInCount += metrics.bytesInCount;
        topicMetrics.messagesInCount += metrics.messagesInCount;
      });
      _.map(topics, (p, key)=>{
        /*let obj = {
          partition: key,
          metrics: p.partitionMetrics,
          topic: topicMetrics
        };*/
        if(p.partitionMetrics == null){
          return;
        }
        let obj = p.partitionMetrics;
        obj.topic = topicMetrics;
        let brokerId = p.partitionMetrics.partitionInfo.leader.id;
        ProgressBarPanels.push(
          <ProgressBarPanel key={topicName+key} patitionStatus={"blue"} progressStatus={96}
            brokerId={brokerId}
            partitions={[obj]}
            topicName={topicName}
            title={topicName+'-P'+key}
            panelType="consumer"
            viewType="consumers"/>
        );
      });
    });
    const labelClass = data.consumerGroupInfo.state == 'Stable' ? "font-green" : (data.consumerGroupInfo.state == 'Dead' ? "font-red" : "font-yellow");
    return(
      <div className="topic-details zIndex20">
        <label className="topic-metric-label">Partitions ({`${ProgressBarPanels.length}`})</label>
        <label className="topic-metric-label">
          State: <span className={labelClass}>{data.consumerGroupInfo.state}</span>
        </label>
        {
          ProgressBarPanels
        }
      </div>
    );
  }
}



class ConsumerPanel extends C_Panel{
  navigateToDetail = () => {
    const {data} = this.props;
    const {router} = this.context;
    router.push({
      pathname : '/consumers/'+data.consumerGroupInfo.id,
      state : {
        consumerId : data.consumerGroupInfo.id
      }
    });
  }
  getHeader(){
    const {eventKey,data,activePanelPool,expanded} = this.props;
    return <div onClick={() => this.handlePanelClick(eventKey)}>
      <span className={`hb success status-icon`}><i className={'fa fa-check'}></i></span>
      <div className="panel-table">
        <div className="panel-sections first">
          <h4 className="schema-th" title={data.consumerGroupInfo.id}>{data.consumerGroupInfo.id}</h4>
          <h6 className={`schema-td font-green-color`} title={data.consumerGroupInfo.active ? 'ACTIVE' : 'INACTIVE'}>{data.consumerGroupInfo.active ? 'ACTIVE' : 'INACTIVE'}</h6>
        </div>
        <div className="panel-sections" style={{width: '30%'}}>
          <h4 className={`schema-td font-blue-color`} title={data.lagCount}>{data.lagCount}</h4>
        </div>
        <div className="panel-sections panel-actions">
          <div><i className="fa fa-list-alt" onClick={this.navigateToDetail} title="Profile"></i></div>
        </div>
        <div className="panel-sections panel-angle">
          {
            expanded ?
            <i className="fa fa-angle-up"></i>
            : <i className="fa fa-angle-down"></i>
          }
        </div>
      </div>
    </div>;
  }
  getContent(){
    return <div className="panel-cust-body">
      <ConsumerDetails2  {...this.props}/>
    </div>;
  }
}

class ConsumerPanelGroup extends C_PanelGroup{
  get Panel(){
    return ConsumerPanel;
  }
}

export {
  TopicPanelGroup,
  BrokerPanelGroup,
  ProducerPanelGroup,
  ConsumerPanelGroup,
  ProgressBar,
  ProgressBarPanel,
  TopicDetails,
  TopicDetails2,
  ProducerDetails,
  ConsumerDetails,
  ConsumerDetails2,
  PercentageBar,
  BrokerDetails2
};
