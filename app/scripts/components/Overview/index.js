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
import {Tabs, Tab, Row, Col, Nav, NavItem, Dropdown, MenuItem,Collapse, Overlay, Popover} from 'react-bootstrap';
import moment from 'moment';
import Site from '../Site';
import FiltersPanel from './FiltersPanel';
import {C_Producers, C_Consumers} from '../CommonComponent/ProducerConsumerList';
import {TopicPanelGroup, BrokerPanelGroup} from '../CommonComponent/Panel';
import TabSideComponent from '../CommonComponent/TabSideComponent';
import {KafkaOverlay, getElementsToConnect} from '../../utils/Kafka-Graph';
import TopicDetailPopup from '../CommonComponent/PopUpComponent/TopicDetailPopup';
import ConsumerDetailPopup from '../CommonComponent/PopUpComponent/ConsumerDetailPopup';
import TopicREST from '../../rest/TopicREST';
import BrokerREST from '../../rest/BrokerREST';
import Modal from '../CommonComponent/FSModal';
import DataExplorer from '../Topics/DataExplorer';
import ConsumerREST from '../../rest/ConsumerREST';
import Utils from '../../utils/Utils';
import MetricsREST from '../../rest/MetricsREST';
import AutoUpdate from '../CommonComponent/AutoUpdate' ;
import ColumnSortComponent, {TopicSortComponent, BrokerSortComponent} from '../CommonComponent/ColumnSortComponent';

export default class Overview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTabKey : 1,
      tabSideComFlagStr : "topics",
      startDate: moment().subtract(30, 'minutes'),
      endDate: moment(),
      popupType : null,
      topics: [],
      brokers: [],
      selectedTopics: [],
      selectedBrokers: [],
      loading: false,
      updating: false,
      sort: '',
      activePanelPool : [],
      consumers:[],
      selectedConsumers: [],
      producers: [],
      selectedProducers: [],
      topicsMetrics:{},
      brokersMetrics: {},
      selectedFilter: '',
      topicSort: {
        attr: 'name',
        type: ''
      },
      producerSort: {
        attr: 'latestOutMessagesCount',
        type: ''
      },
      consumerSort: {
        attr: 'lagCount',
        type: ''
      },
      brokerSort: {
        attr: 'node.id',
        type: ''
      }
    };
    app_state.headerContent = this.getHeaderContent();
  }
  componentDidMount(){
    this.fetchData('loading');
  }

  updateData = () => {
    this.fetchData('updating');
  }

  fetchData(loader){
    const {selectedTopic, sort} = this.state;
    const stateObj = this.state;
    const sortFlag = sort === 'Asc' ? true : false;
    const params=Utils.getItemFromLocalStorage("dateRange");
    stateObj[loader] = true;
    this.setState(stateObj, () => {
      const PromiseArr = [];

      PromiseArr.push(MetricsREST.getAggregatedTopics(params).then((res) => {
        stateObj.topics = res.aggrTopicMetricsCollection;
        Utils.refTopicToPartition(res.aggrTopicMetricsCollection);
        this.setState(stateObj);
        return res;
      }));
      PromiseArr.push(MetricsREST.getAggregatedBrokers(params).then((res) => {
        stateObj.brokers = res.aggrBrokerMetricsCollection;
        this.setState(stateObj);
        return res;
      }));
      PromiseArr.push(MetricsREST.getAggregatedConsumers(params).then((res) => {
        stateObj.consumers = res;
        Utils.addLagCountInConsumers(res);
        this.setState(stateObj);
        return res;
      }));
      PromiseArr.push(MetricsREST.getAggregatedProducers(params).then((res) => {
        stateObj.producers = Utils.getProducersFromProducerResponse(res);
        this.setState(stateObj);
        return res;
      }));

      Promise.all(PromiseArr).then((res) => {
        stateObj[loader] = false;
        stateObj.updatedTime = moment();
        Utils.brokerTopicSync(stateObj.brokers, stateObj.topics);
        this.setState(stateObj, () => {
        });
      }, (err) => {
        stateObj[loader] = false;
        stateObj.updatedTime = moment();
        this.setState(stateObj);
        Utils.showResponseError(err);
      });
    });
  }

  getSorted(arr, obj, type){
    switch(type){
    case 'topic': return Utils.topicSorting(arr, obj);
      break;
    case 'producer': return Utils.sidePanelSorting(arr, obj);
      break;
    case 'consumer': return  Utils.sidePanelSorting(arr, obj);
      break;
    case 'broker': return  Utils.brokerSorting(arr, obj);
      break;
    default: null;
      break;
    }
  }

  getFiltered(arr, selected, attrName){
    const {selectedTopics, selectedBrokers, selectedConsumers, selectedProducers} = this.state;
    let filtered = [];
    if(selectedTopics.length == 0 && selectedBrokers.length == 0 && selectedConsumers.length == 0 && selectedProducers.length == 0) {
      filtered = arr;
    }
    if(selected.length){
      filtered = _.filter(arr, (t)=>{
        return selected.indexOf(_.get(t, attrName)) > -1;
      });
    }
    return filtered;
  }
  getFilteredAndSortedTopics = () => {
    const {selectedTopics, topics, topicSort} = this.state;
    const filtered = this.getFiltered(topics, selectedTopics, "name");
    const filteredAndSorted = this.getSorted(filtered, topicSort,'topic');
    return filteredAndSorted;
  }
  getFilteredAndSortedBrokers = () => {
    const {selectedBrokers, brokers,brokerSort} = this.state;
    const filtered = this.getFiltered(brokers, selectedBrokers, "node.id");
    const filteredAndSorted = this.getSorted(filtered, brokerSort,'broker');
    return filteredAndSorted;
  }
  getFilteredAndSortedConsumers = () => {
    const {selectedConsumers, consumers,consumerSort} = this.state;
    const filtered = this.getFiltered(consumers, selectedConsumers, "consumerGroupInfo.id");
    const filteredAndSorted = this.getSorted(filtered, consumerSort,'consumer');
    return filteredAndSorted;
  }
  getFilteredAndSortedProducers = () => {
    const {selectedProducers, producers,producerSort} = this.state;
    const filtered = this.getFiltered(producers, selectedProducers, "clientId");
    const filteredAndSorted = this.getSorted(filtered, producerSort,'producer');
    return filteredAndSorted;
  }
  setFilteredTopics = (data) => {
    const {selectedTopics, topics} = this.state;
    let selectedProducers = [], selectedConsumers = [], selectedBrokers = [], selectedFilter = '';

    if(data.length){
      const filtered = this.getFiltered(topics, data, "name");

      _.each(filtered, (topic) => {
        _.each(topic.partitionMetrics, (partition) => {
          selectedProducers.push.apply(selectedProducers, _.keys(partition.producerIdToOutMessagesCount));
          selectedConsumers.push.apply(selectedConsumers, _.keys(partition.consumerGroupIdToLag));
          selectedBrokers.push(partition.aggrTopicPartitionMetrics.partitionInfo.leader.id);
        });
      });

      selectedProducers = _.uniq(selectedProducers);
      selectedConsumers = _.uniq(selectedConsumers);
      selectedBrokers = _.uniq(selectedBrokers);
      selectedFilter = 'topics';
    }

    this.setState({
      selectedTopics: data,
      selectedProducers: selectedProducers,
      selectedConsumers: selectedConsumers,
      selectedBrokers: selectedBrokers,
      selectedFilter: selectedFilter
    });
    if(this.KafkaGraph) {
      this.KafkaGraph.close();
    }
  }
  setFilteredBrokers = (data) => {
    const {selectedBrokers, brokers} = this.state;
    let selectedProducers = [], selectedTopics = [], selectedConsumers = [], selectedFilter = '';

    if(data.length){
      const filtered = this.getFiltered(brokers, data, "node.id");

      _.each(filtered, (broker) => {
        _.each(broker.partitions, (partition) => {
          const p = partition.detail.partitionInfo.partition;
          selectedTopics.push(partition.topic.name);
          const _p = partition.topic.partitionMetrics[p];
          selectedProducers.push.apply(selectedProducers, _.keys(_p.producerIdToOutMessagesCount));
          selectedConsumers.push.apply(selectedConsumers, _.keys(_p.consumerGroupIdToLag));
        });

        selectedProducers = _.uniq(selectedProducers);
        selectedConsumers = _.uniq(selectedConsumers);
        selectedTopics = _.uniq(selectedTopics);
        selectedFilter = 'brokers';
      });
    }
    this.setState({
      selectedBrokers: data,
      selectedProducers: selectedProducers,
      selectedConsumers: selectedConsumers,
      selectedTopics: selectedTopics,
      selectedFilter: selectedFilter
    });
  }
  setFilteredConsumers = (data) => {
    const {selectedConsumers, consumers} = this.state;
    let selectedProducers = [], selectedTopics = [], selectedBrokers = [], selectedFilter = '';

    if(data.length){
      const filtered = this.getFiltered(consumers, data, "consumerGroupInfo.id");

      _.each(filtered, (consumer) => {
        _.each(consumer.wrappedPartitionMetrics, (partitions, topicName) => {
          selectedTopics.push(topicName);

          _.each(partitions, (partition) => {
            selectedProducers.push.apply(selectedProducers, _.keys(partition.producerIdToOutMessagesCount));
            if(partition.partitionMetrics !== null) {
              selectedBrokers.push(partition.partitionMetrics.partitionInfo.leader.id);
            }
          });
        });
      });

      selectedProducers = _.uniq(selectedProducers);
      selectedTopics = _.uniq(selectedTopics);
      selectedBrokers = _.uniq(selectedBrokers);
      selectedFilter = 'consumers';
    }

    this.setState({
      selectedConsumers: data,
      selectedProducers: selectedProducers,
      selectedTopics: selectedTopics,
      selectedBrokers: selectedBrokers,
      selectedFilter: selectedFilter
    });
    if(this.KafkaGraph) {
      this.KafkaGraph.close();
    }
  }
  setFilteredProducers = (data) => {
    const {selectedProducers, producers} = this.state;
    let selectedConsumers = [], selectedTopics = [], selectedBrokers = [], selectedFilter = '';

    if(data.length){
      const filtered = this.getFiltered(producers, data, "clientId");

      _.each(filtered, (producer) => {
        _.each(producer.wrappedPartitionMetrics, (partitions, topicName) => {
          selectedTopics.push(topicName);

          _.each(partitions, (partition) => {
            selectedConsumers.push.apply(selectedConsumers, _.keys(partition.consumerGroupIdToLag));
            if(partition.partitionMetrics !== null) {
              selectedBrokers.push(partition.partitionMetrics.partitionInfo.leader.id);
            }
          });
        });
      });

      selectedConsumers = _.uniq(selectedConsumers);
      selectedTopics = _.uniq(selectedTopics);
      selectedBrokers = _.uniq(selectedBrokers);
      selectedFilter = 'producers';
    }

    this.setState({
      selectedProducers: data,
      selectedConsumers: selectedConsumers,
      selectedTopics: selectedTopics,
      selectedBrokers: selectedBrokers,
      selectedFilter: selectedFilter
    });
    if(this.KafkaGraph) {
      this.KafkaGraph.close();
    }
  }
  getHeaderContent() {
    return (
      <span>
        Overview
      </span>
    );
  }
  handlePopupClose = () => {
    this.setState({popupType : null});
  }

  topicModalResolve = () => {
    this.topicModal.hide();
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

  handleSelect = (eventKey) => {
    let tPool = _.cloneDeep(this.state.activePanelPool);
    const index = _.findIndex(tPool, (p) => p === eventKey);
    if(index !== -1){
      tPool.splice(index,1);
    } else {
      tPool.push(eventKey);
    }
    this.setState({activePanelPool : tPool});
  }

  sortTopicByAttr = (dataset) => {
    this.setStateSortingObj(dataset);
  }

  sidePanelSorting = (e) => {
    this.setStateSortingObj(e.target.dataset);
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

  getTopicContent(){
    const {popupType, topics,activePanelPool,consumers, producers, topicsMetrics, brokers, topicSort, producerSort,consumerSort} = this.state;

    const _topics = this.getFilteredAndSortedTopics();
    const _producers = this.getFilteredAndSortedProducers();
    const _consumers = this.getFilteredAndSortedConsumers();

    const panelProps = {
      activePanelPool:activePanelPool,
      handleSelect : this.handleSelect.bind(this),
      showTopicModal : this.showTopicModal.bind(this),
      handlePartitionClick : this.handlePartitionClick.bind(this),
      brokers :brokers
    };

    return {
      topics: _topics,
      Component: [
        <C_Producers data={_producers} key="c_producers" vAlign={false}  onClick={this.handleProducerClick.bind(this,'producer')} sidePanelSorting={this.sidePanelSorting} producerSort={producerSort} enableSort={true} producerAction={this.setFilteredProducers}
          enableActiveInactive={true}
        />,
        <div className="col-md-8 flex-col-8" key="list">
          {
            _topics.length > 0
            ? [<TopicSortComponent key={1} topicSort={topicSort} sortTopicByAttr={this.sortTopicByAttr}/>,
              <TopicPanelGroup key={2} data={_topics} panelProps={panelProps} topicsMetrics={topicsMetrics}/>]
            : <div style={{textAlign: 'center'}}>No Data Found</div>
          }
          {
            popupType === "topic" && false
            ? <TopicDetailPopup ref="popupContainer" closePopup={this.handlePopupClose}/>
            : popupType === "consumer" && false
              ? <ConsumerDetailPopup ref="popupContainer" closePopup={this.handlePopupClose}/>
              : null
          }
        </div>,
        (this.topicOverLay || null),
        (this.allPartitionBtn || null),
        <C_Consumers data={_consumers} key="c_consumers" vAlign={false}  onClick={this.handleConsumerClick.bind(this,'consumer')} sidePanelSorting={this.sidePanelSorting} consumerSort={consumerSort} enableSort={true} consumerAction={this.setFilteredConsumers}
          enableActiveInactive={true} />
      ]
    };
  }
  componentWillUnmount(){
    const overlay = document.querySelector('.kafka-graph-overlay-container');
    if(!!overlay){
      overlay.innerHTML='';
      overlay.style.height=0;
    }
  }
  getBrokerContent(){
    const {brokers, topics,activePanelPool, producerSort,consumerSort,brokerSort} = this.state;

    const _brokers = this.getFilteredAndSortedBrokers();
    const _producers = this.getFilteredAndSortedProducers();
    const _consumers = this.getFilteredAndSortedConsumers();

    const panelProps = {
      activePanelPool:activePanelPool,
      handleSelect : this.handleSelect.bind(this),
      handlePartitionClick : this.handlePartitionClick.bind(this)
    };

    return {
      brokers: _brokers,
      Component : [
        <C_Producers data={_producers} key="c_producers" vAlign={false} onClick={this.handleProducerClick.bind(this,'producer')}  sidePanelSorting={this.sidePanelSorting} producerSort={producerSort} enableSort={true} producerAction={this.setFilteredProducers}
          enableActiveInactive={true}
        />,
        <div className="col-md-8 flex-col-8" key="list">
          {
            _brokers.length > 0
            ? [<BrokerSortComponent key={1} brokerSort={brokerSort} sortByAttr={this.sortTopicByAttr}/>,
              <BrokerPanelGroup key={2} data={_brokers} topics={topics}  panelProps={panelProps}/>]
            : <div style={{textAlign: 'center'}}>No Data Found</div>
          }
        </div>,
        (this.topicOverLay || null),
        <C_Consumers data={_consumers} key="c_consumers" vAlign={false} onClick={this.handleConsumerClick.bind(this,'consumer')}  sidePanelSorting={this.sidePanelSorting} consumerSort={consumerSort} enableSort={true} consumerAction={this.setFilteredConsumers}
          enableActiveInactive={true} />
      ]
    };
  }
  datePickerHandler = (date) => {
    Utils.setItemToLocalStorage(date);
    this.fetchData('loading');
  }
  onSelectTab = (eventKey) => {
    let str = eventKey === 1
              ? "topics"
              : "brokers";
    this.setState({activeTabKey : eventKey,tabSideComFlagStr : str});
  }
  onSort = (eventKey) => {
    // this.setState({sort: eventKey});
  }
  drawKafkaGraph = (fromToElement,type,tempPool) => {
    tempPool = tempPool || this.state.activePanelPool;
    if(!this.KafkaGraph){
      this.KafkaGraph = true; //prevents double click
      // Collapse.defaultProps.timeout = 0;
      this.setState({popupType : type, activePanelPool:tempPool},() => {
        setTimeout(() => {
          this.KafkaGraph = new KafkaOverlay(fromToElement);
          this.KafkaGraph.onClose = () => {
            delete this.KafkaGraph;
            // Collapse.defaultProps.timeout = 300;
            this.topicOverLay = null;
            this.allPartitionBtn = null;
            this.setState({popupType : null});
          };
        },0);
      });
    }
  }
  handleProducerClick = (type, evt) => {
    const {consumers, producers,activeTabKey} = this.state;
    evt.stopPropagation();
    let producer={},tempPool=[],fromToElement=[];

    const target_name = evt.currentTarget.dataset[type];

    producer = _.find(producers,{clientId : target_name});

    const pushFromToElement = function(fromTo){
      const existsFromTo = _.find(fromToElement, (_fromTo) => {
        return fromTo.from == _fromTo.from && fromTo.to == _fromTo.to;
      });
      if(!existsFromTo && fromTo.from && fromTo.to){
        fromToElement.push(fromTo);
      }
    };

    _.each(producer.wrappedPartitionMetrics, (partitions, topicName) => {
      tempPool.push(topicName);
    });
    if(activeTabKey === 2){
      tempPool = this.getBrokerTempPool(tempPool);
    }
    this.setState({activePanelPool:tempPool}, () => {
      _.each(producer.wrappedPartitionMetrics, (partitions, topicName) => {
        _.each(partitions, (client, partition) => {
          const topicEl = document.querySelector(`[data-topicname=${topicName}][data-b-p${partition}]`);
          if(topicEl){
            const fromTo = {
              from: document.querySelector(`[data-producer="${target_name}"]`),
              to : topicEl.querySelector('.hb')
            };
            pushFromToElement(fromTo);

            if(!_.isEmpty(client.consumerGroupIdToLag)){
              const consumerGroups = _.keys(client.consumerGroupIdToLag);
              _.each(consumerGroups, (consumer) => {
                const fromToConsumer = {
                  from: topicEl,
                  to : document.querySelector(`[data-consumer="${consumer}"]`)
                };
                pushFromToElement(fromToConsumer);
              });
            }
          }
        });
      });

      if(fromToElement.length){
        this.drawKafkaGraph(fromToElement,type, tempPool);
      } else {
        console.error('No producer or consumer to connect');
      }

    });
  }

  getBrokerTempPool(tempPool){
    const {brokers} = this.state;
    let brokerTempPool=[];
    _.each(brokers,(broker) => {
      const found = _.findIndex(broker.partitions, (p) => {
        return tempPool.indexOf(p.topic.name) > -1;
      });
      if(found !== undefined){
        brokerTempPool.push(broker.node.id);
      }
    });
    return brokerTempPool;
  }

  handleConsumerClick = (type,evt) => {
    const {producers,activeTabKey} = this.state;
    evt.stopPropagation();
    let consumer={},tempPool=[],fromToElement=[];

    const target_name = evt.currentTarget.dataset[type];
    const consumerArr = this.state.consumers;

    consumer = _.find(consumerArr,(c) => {
      return c.consumerGroupInfo.id == target_name;
    });

    const pushFromToElement = function(fromTo){
      const existsFromTo = _.find(fromToElement, (_fromTo) => {
        return fromTo.from == _fromTo.from && fromTo.to == _fromTo.to;
      });
      if(!existsFromTo && fromTo.from && fromTo.to){
        fromToElement.push(fromTo);
      }
    };

    _.each(consumer.wrappedPartitionMetrics, (partitions, topicName) => {
      tempPool.push(topicName);
    });
    if(activeTabKey === 2){
      tempPool = this.getBrokerTempPool(tempPool);
    }
    this.setState({activePanelPool: tempPool}, () => {

      _.each(consumer.consumerGroupInfo.topicPartitionAssignments, (partitions, topicName) => {
        _.each(partitions, (client, partition) => {
          const fromTo = {
            from : document.querySelector(`[data-topicname=${topicName}][data-b-p${partition}]`),
            to: document.querySelector(`[data-consumer="${target_name}"]`)
          };
          pushFromToElement(fromTo);
        });
      });

      _.each(consumer.wrappedPartitionMetrics, (partitions, topicName) => {
        _.each(partitions, (obj, partition) => {
          const producers = _.keys(obj.producerIdToOutMessagesCount);
          _.each(producers, (p) => {
            const topicEl = document.querySelector(`[data-topicname=${topicName}][data-b-p${partition}]`);
            if(topicEl){
              const fromTo = {
                from: document.querySelector(`[data-producer="${p}"]`),
                to : topicEl.querySelector('.hb')
              };
              pushFromToElement(fromTo);
            }
          });
        });
      });

      if(fromToElement.length){
        this.drawKafkaGraph(fromToElement,type, tempPool);
      } else {
        console.error('No producer or consumer to connect');
      }

    });
  }
  handlePartitionClick = (obj, e, allPartitions) => {
    const {topics,consumers,type,producers,activeTabKey} = this.state;
    let fromToElement=[],tempPool=[obj.topic];

    const pushFromToElement = function(fromTo){
      const existsFromTo = _.find(fromToElement, (_fromTo) => {
        return fromTo.from == _fromTo.from && fromTo.to == _fromTo.to;
      });
      if(!existsFromTo && fromTo.from && fromTo.to){
        fromToElement.push(fromTo);
      }
    };

    const topicElContainer = document.querySelector(`[data-topicname=${obj.topic}][data-b-p${obj.partition}]`);

    this.topicOverLay = (<Overlay
          show={true}
          placement="top"
          container={document.getElementsByTagName("body").item(0)}
          target={topicElContainer}
        >
          <Popover id="progress-partition-overlay">
            <h4 style={{wordWrap: 'break-word'}}>Topic: {obj.topic} - P{obj.partition}</h4>
            <div style={{padding: '5px 0'}}><span>DATA IN </span>{obj.dataIn}</div>
            <div style={{padding: '5px 0'}}><span>DATA OUT </span>{obj.dataOut}</div>
            {this.props.onClick !== null ?
            <div>
              <Link to={"/topics/"+obj.topic}>PROFILE</Link>
              <a onClick={()=>{this.setFilteredTopics([obj.topic]);}}>FILTER</a>
              <Link to={{pathname: "/topics/"+obj.topic, state: {showDataExplorer: true, partition: obj.partition}}}>EXPLORE</Link>
            </div>
            : null
            }
          </Popover>
        </Overlay>
      );

    this.allPartitionBtn = (<Overlay
          show={true}
          placement="bottom"
          noCaret
          container={document.getElementsByTagName("body").item(0)}
          target={topicElContainer}
        >
          <div className="all-partition-btn">
            <a onClick={this.handlePartitionClick.bind(this, obj, null, true)}>ALL PARTITIONS</a>
          </div>
        </Overlay>
      );

    _.each(producers, (producer) => {
      _.each(producer.wrappedPartitionMetrics, (partitions, topicName) => {
        if(topicName == obj.topic){
          _.each(partitions, (client, partition) => {
            if(allPartitions || partition == obj.partition){
              const topicEl = document.querySelector(`[data-topicname=${topicName}][data-b-p${partition}]`);
              if(topicEl){
                const fromTo = {
                  from: document.querySelector(`[data-producer="${producer.clientId}"]`),
                  to : topicEl.querySelector('.hb')
                };
                pushFromToElement(fromTo);
              }
            }
          });
        }
      });
    });

    _.each(consumers, (consumer) => {
      _.each(consumer.consumerGroupInfo.topicPartitionAssignments, (partitions, topicName) => {
        if(topicName == obj.topic){
          _.each(partitions, (client, partition) => {
            if(allPartitions || partition == obj.partition){
              const fromTo = {
                from : document.querySelector(`[data-topicname=${topicName}][data-b-p${partition}]`),
                to: document.querySelector(`[data-consumer="${consumer.consumerGroupInfo.id}"]`)
              };
              pushFromToElement(fromTo);
            }
          });
        }
      });
    });

    if(allPartitions && this.KafkaGraph) {
      this.KafkaGraph.close();
    }

    if(activeTabKey === 2){
      tempPool = this.getBrokerTempPool(tempPool);
    }

    if(!obj.showAllPartitionsBtn) {
      this.allPartitionBtn = null;
    }

    if(fromToElement.length){
      this.drawKafkaGraph(fromToElement,type, undefined);
    } else {
      this.topicOverLay = null;
      this.allPartitionBtn = null;
      console.error('No producer or consumer to connect');
    }
  }
  render() {
    let {
      activeTabKey,
      tabSideComFlagStr,
      startDate,
      endDate,
      topics,
      brokers,
      selectedTopic,
      consumers,
      producers,
      loading,
      sort,
      updatedTime,
      updating,
      selectedTopics,
      selectedBrokers,
      selectedProducers,
      selectedConsumers,
      selectedFilter
    } = this.state;

    let TopicContent = null, BrokerContent = null;
    TopicContent = this.getTopicContent();
    BrokerContent = this.getBrokerContent();


    return (
      <Site>
        <FiltersPanel
          topics={topics}
          topicAction={this.setFilteredTopics}
          selectedTopics={selectedTopics}
          brokers={brokers}
          brokerAction={this.setFilteredBrokers}
          selectedBrokers={selectedBrokers}
          consumers={consumers}
          consumerAction={this.setFilteredConsumers}
          selectedConsumers={selectedConsumers}
          producers={producers}
          producerAction={this.setFilteredProducers}
          selectedProducers={selectedProducers}
          selectedFilter={selectedFilter} />
        <Tab.Container id="overview-tabs" activeKey={activeTabKey} onSelect={this.onSelectTab}>
          <Row className="clearfix">
          <Col sm={12} className="tab-padding">
            <Nav bsStyle="tabs">
              <NavItem eventKey={1}>TOPICS ({TopicContent.topics.length})</NavItem>
              <NavItem eventKey={2}>BROKERS ({BrokerContent.brokers.length})</NavItem>
              <div className="text-right">
                {/*<AutoUpdate
                  updateCallback={this.updateData}
                  updatedTime={updatedTime}
                  updating={updating}
                />
                <Dropdown
                  id="overview-dropdown-sort"
                  onSelect={this.onSort}
                  pullRight
                >
                  <Dropdown.Toggle>
                    <i className="fa fa-sort m-r-xs" />
                    Name
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <MenuItem eventKey="Asc" className={sort === "Asc" ? "active" : ""}> Ascending</MenuItem>
                    <MenuItem eventKey="Dsc" className={sort === "Dsc" ? "active" : ""}> Descending</MenuItem>
                  </Dropdown.Menu>
                </Dropdown>&nbsp;*/}
                <TabSideComponent viewMode={tabSideComFlagStr} datePickerHandler={this.datePickerHandler} startDate={startDate} endDate={endDate}/>
              </div>
            </Nav>
          </Col>
          <Col sm={12}>
            <Tab.Content animation>
              <Tab.Pane eventKey={1}>
                <div className="flexbox-container">
                  {activeTabKey == 1 ? TopicContent.Component : ''}
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey={2}>
                <div className="flexbox-container">
                  {activeTabKey == 2 ? BrokerContent.Component : ''}
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
        </Tab.Container>
        <Modal bsSize="large" dialogClassName="modal-xl" ref={(ref) => this.topicModal = ref} hideFooter data-title="Data Explorer" data-resolve={this.topicModalResolve} data-reject={this.topicModalReject}>
          <DataExplorer startDate={startDate} endDate={endDate} selectedTopic={selectedTopic}/>
        </Modal>
        {loading ? <div className="loading"></div> : null}
      </Site>
    );
  }
}
