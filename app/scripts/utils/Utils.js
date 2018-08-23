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

import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import fetch from 'isomorphic-fetch';
import * as Constants from './Constants';
import FSReactToastr from '../components/CommonComponent/FSReactToastr' ;
import CommonNotification from './CommonNotification';

const sortArray = function(sortingArr, keyName, ascendingFlag) {
  var original = sortingArr.slice(0);
  let sorted = sortingArr;
  sorted = sortingArr.sort(function(a, b) {
    const _a = _.get(a, keyName);
    const _b = _.get(b, keyName);
    let res;
    if(_.isNumber(_a) && _.isNumber(_b)) {
      res = _b - _a;
    } else {
      res = _b.localeCompare(_a);
    }
    if(res == 0){
      if(ascendingFlag){
        res = original.indexOf(a) > original.indexOf(b) ? 1 : -1;
      }else{
        res = original.indexOf(a) < original.indexOf(b) ? 1 : -1;
      }
    }
    return res;
  });
  if (!ascendingFlag) {
    sorted = sorted.reverse();
  }
  return sorted;
};

const numberToMilliseconds = function(number, type) {
  if (type === 'Seconds') {
    return number * 1000;
  } else if (type === 'Minutes') {
    return number * 60000;
  } else if (type === 'Hours') {
    return number * 3600000;
  }
};

const millisecondsToNumber = function(number) {
  let hours = (number / (1000 * 60 * 60)) % 24;
  let minutes = (number / (1000 * 60)) % 60;
  let seconds = (number / (1000)) % 60;
  if (hours % 1 === 0) {
    return {
      number: (number / (1000 * 60 * 60)),
      type: 'Hours'
    };
  } else if (minutes % 1 === 0) {
    return {
      number: (number / (1000 * 60)),
      type: 'Minutes'
    };
  } else if (seconds % 1 === 0) {
    return {
      number: (number / (1000)),
      type: 'Seconds'
    };
  } else {
    console.error("Something went wrong in converting millseconds to proper format");
  }
};

const capitaliseFirstLetter = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const splitTimeStamp = function(date) {
  const currentDT = moment(new Date());
  const createdDT = moment(date);
  const dateObj = moment.duration(currentDT.diff(createdDT));
  return ((dateObj._data.days === 0)
    ? ''
    : dateObj._data.days + 'd ') + ((dateObj._data.days === 0 && dateObj._data.hours === 0)
    ? ''
    : dateObj._data.hours + 'h ') + ((dateObj._data.days === 0 && dateObj._data.hours === 0 && dateObj._data.minutes === 0)
    ? ''
    : dateObj._data.minutes + 'm ') + dateObj._data.seconds + 's ago';
};

const splitSeconds = function(sec_num) {
  let days = Math.floor(sec_num / (3600 * 24));
  let hours = Math.floor((sec_num - (days * (3600 * 24))) / 3600);
  let minutes = Math.floor((sec_num - (days * (3600 * 24)) - (hours * 3600)) / 60);
  let seconds = Math.floor(sec_num - (days * (3600 * 24)) - (hours * 3600) - (minutes * 60));

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  return ((days === 0)
    ? ''
    : days + 'd ') + ((days === 0 && (hours == "00" || 0))
    ? ''
    : hours + 'h ') + ((days === 0 && (hours == "00" || 0) && minutes === 0)
    ? ''
    : minutes + 'm ') + seconds + 's ago';
};

const filterByName = function(entities, filterValue, attributeName) {
  let matchFilter = new RegExp(filterValue, 'i');
  return entities.filter(filteredList => !filterValue || matchFilter.test(_.get(filteredList, attributeName)));
};

const ellipses = function(string, len) {
  if (!string) {
    return;
  }
  const str = string.substr(0, len || 10); // default 10 character...
  return (string.length > len)
    ? `${str}...`
    : str;
};

const secToMinConverter = function(milliseconds, src) {
  milliseconds = (!milliseconds)
    ? 0
    : milliseconds;
  let hours = milliseconds / (1000 * 60 * 60);
  let absoluteHours = Math.floor(hours);
  let f_hours = absoluteHours > 9
    ? absoluteHours
    : 0 + absoluteHours;

  //Get remainder from hours and convert to minutes
  let minutes = (hours - absoluteHours) * 60;
  let absoluteMinutes = Math.floor(minutes);
  let f_mins = absoluteMinutes > 9
    ? absoluteMinutes
    : 0 + absoluteMinutes;

  //Get remainder from minutes and convert to seconds
  let seconds = (minutes - absoluteMinutes) * 60;
  let absoluteSeconds = Math.floor(seconds);
  let f_secs = absoluteSeconds > 9
    ? absoluteSeconds
    : 0 + absoluteSeconds;

  (f_hours !== 0)
    ? milliseconds = (src === "list")
      ? _.round(f_hours + "." + f_mins) + " hours"
      : _.round(f_hours + "." + f_mins) + "/hours"
    : (f_mins !== 0 && f_secs !== 0)
      ? milliseconds = (src === "list")
        ? _.round(f_mins + "." + f_secs) + " mins"
        : _.round(f_mins + "." + f_secs) + "/mins"
      : milliseconds = (src === "list")
        ? _.round(f_secs) + " sec"
        : _.round(f_secs) + "/sec";
  return milliseconds;
};

const kFormatter = function(num) {
  num = (!num)
    ? 0
    : num;
  return num > 999 || num < -999
    ? (num / 1000).toFixed(1) + 'k'
    : num.toFixed(1);
};

const isFloat = function(n) {
  return n === +n && n !== (n|0);
};

const isInteger = function(n) {
  return n === +n && n === (n|0);
};

const abbreviateNumber = function(value) {
  var newValue = value || 0;var suffix = "";
  if (newValue >= 1000 || newValue <= -1000) {
    var suffixes = ["", "k", "m", "b","t"];
    var suffixNum = Math.floor( (""+parseInt(newValue)).length/3 );
    var shortValue = '';
    for (var precision = 2; precision >= 1; precision--) {
      shortValue = parseFloat( (suffixNum != 0 ? (newValue / Math.pow(1000,suffixNum) ) : newValue).toPrecision(precision));
      var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
      if (dotLessShortValue.length <= 2) { break; }
    }
    if (shortValue % 1 != 0)  {shortValue = shortValue.toFixed(1);}
    newValue = shortValue;
    suffix = suffixes[suffixNum];
  } else {
    if(isFloat(newValue)){
      newValue = newValue.toFixed(1);
    }else{
      newValue = newValue.toFixed(0);
    }
  }
  return {value: newValue, suffix: suffix};
};

const convertMillsecondsToSecond = function(milliSec) {
  return Math.round(milliSec / 1000);
};

const formatLatency = function (milliSec) {
  var val = milliSec || 0, suffix = 'ms';
  if(val >= 1000) {
    val = val / 1000;
    suffix = 'sec';
    if(val >= 60) {
      val = val / 60;
      suffix = 'min';
      if(val >= 60) {
        val = val / 60;
        suffix = 'h';
      }
    }
  }
  return {value: val.toFixed(1), suffix: suffix};
};

const isMergeableObject = function (val) {
  let nonNullObject = val && typeof val === 'object';

  return nonNullObject
    && Object.prototype.toString.call(val) !== '[object RegExp]'
    && Object.prototype.toString.call(val) !== '[object Date]';
};

const emptyTarget = function (val) {
  return Array.isArray(val) ? [] : {};
};

const cloneIfNecessary = function (value, optionsArgument) {
  let clone = optionsArgument && optionsArgument.clone === true;
  return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value;
};

const defaultArrayMerge = function (target, source, optionsArgument) {
  let destination = target.slice();
  source.forEach(function(e, i) {
    if (typeof destination[i] === 'undefined') {
      destination[i] = cloneIfNecessary(e, optionsArgument);
    } else if (isMergeableObject(e)) {
      destination[i] = deepmerge(target[i], e, optionsArgument);
    } else if (target.indexOf(e) === -1) {
      destination.push(cloneIfNecessary(e, optionsArgument));
    }
  });
  return destination;
};

const mergeObject = function (target, source, optionsArgument) {
  let destination = {};
  if (isMergeableObject(target)) {
    Object.keys(target).forEach(function (key) {
      destination[key] = cloneIfNecessary(target[key], optionsArgument);
    });
  }
  Object.keys(source).forEach(function (key) {
    if (!isMergeableObject(source[key]) || !target[key]) {
      destination[key] = cloneIfNecessary(source[key], optionsArgument);
    } else {
      destination[key] = deepmerge(target[key], source[key], optionsArgument);
    }
  });
  return destination;
};

const deepmerge = function (target, source, optionsArgument) {
  let array = Array.isArray(source);
  let options = optionsArgument || { arrayMerge: defaultArrayMerge };
  let arrayMerge = options.arrayMerge || defaultArrayMerge;

  if (array) {
    return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument);
  } else {
    return mergeObject(target, source, optionsArgument);
  }
};

const deepmergeAll = function deepmergeAll(array, optionsArgument) {
  if (!Array.isArray(array) || array.length < 2) {
    throw new Error('first argument should be an array with at least two elements');
  }

  // we are sure there are at least 2 values, so it is safe to have no initial value
  return array.reduce(function(prev, next) {
    return deepmerge(prev, next, optionsArgument);
  });
};

const checkTypeAndReturnValue = function(data){
  if(typeof(data) === "boolean"){
    data = data.toString();
  }
  if(!data){
    return;
  }
  if(data){
    let exp = /[,:{}]/g ,valideJson = '';
    exp.test(data)
    ? valideJson = validateJSON(data)
    : valideJson = false;

    if(!valideJson){
      const checkNaN = Number(data);
      if(isNaN(data)){
        return data === "true"
              ? true
              : data === "false"
                ? false
                : data;
      } else {
        return Number(data);
      }
    } else {
      return JSON.parse(data);
    }
  }
};


const customFetch = (url, options) => {
  const headers = options.headers || {};

  headers['X-DP-original-service-endpoint'] = Constants.restUrl;

  options.headers = headers;
  return fetch(url, options);
};

const checkStatus = function (response) {
  if (response.status >= 200 && response.status < 300) {
    return response.json();
  } else {
    const error = new Error(response.statusText);
    const contentType = response.headers.get('content-type');
    if(contentType.indexOf('json') >= 0){
      error.response = response.json();
    }else{
      error.response = response.text();
    }
    throw error;
  }
};

const checkStatusForResponseText = function (response) {
  if (response.status >= 200 && response.status < 300) {
    return response.json();
  } else {
    const error = new Error(response.statusText);
    error.response = response.text();
    throw error;
  }
};

const showResponseError = (err) => {
  if(err.response){
    err.response.then((o) => {
      let msg;
      if(_.isObject(o)){
        msg = o.responseMessage;
      }else{
        msg = o;
      }
      FSReactToastr.error(<CommonNotification flag="error" content={msg}/>, '', Constants.toastOpt);
    });
  }else{
    FSReactToastr.error(<CommonNotification flag="error" content={err.message}/>, '', Constants.toastOpt);
  }
};

const matchStringInArr = function(stringArr,str){
  let match=false;
  _.map(stringArr.split(','), (s) => {
    if(s === str){
      match = true;
    }
  });
  return match;
};

const noSpecialCharString = function(string){
  if(string === ''){
    return;
  }
  return /^[a-zA-Z0-9_-]+$/.test(string);
};

const setTimoutFunc = function(callBack,timer){
  return setTimeout(() => {
    callBack();
  },!!timer ? timer : 3000);
};

const removeSpecialCharToSpace = (str) => {
  return str.replace(/[`~!@#$%^&*0-9()|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/gi, ' ');
};

const addLagCountInConsumers = (consumers) => {
  _.each(consumers, (consumer) => {
    consumer.lagCount = 0;
    _.each(consumer.consumerGroupInfo.topicPartitionAssignments,(topic)=>{
      _.each(topic, (p)=>{
        consumer.lagCount += p.lag;
      });
    });
  });
};

const getHighestTimestampValue = (obj) => {
  if(_.isEmpty(obj) || _.isUndefined(obj)){
    return 0;
  }
  const keys = _.keys(obj).sort((a,b) => {
    return a > b;
  });
  const highestTimestamp = keys[keys.length-1];
  return obj[highestTimestamp];
};

const getTableRowData = (data) => {
  function getConsumerInstances(consumer){
    let totalLag=0,rowData = [];
    _.map(consumer.topicPartitionAssignments, (partitions,topicName) => {
      _.map(partitions, (val, key)=>{
        totalLag += val.lag;
        rowData.push({
          topic: topicName,
          instance: val.consumerInstanceId,
          partition: key,
          lag: val.lag,
          host: val.host,
          offset: val.offset,
          'log ends': val.logEndOffset
        });
      });
    });
    return {rowData,totalLag};
  }
  if(_.isArray(data)){
    const rowData = [];
    let totalLag = 0;
    _.each(data, (d) => {
      const i = getConsumerInstances(d);
      rowData.push.apply(rowData, i.rowData);
      totalLag += i.totalLag;
    });
    return {rowData,totalLag};
  }else{
    return getConsumerInstances(data);
  }
};

const addProducerTopicPartitions = (producers) => {
  function addTopicPartitions(producer){
    const topicPartitions = [];
    if(producer.partitionToInMessageCount == null){
      return;
    }
    const keys = _.keys(producer.partitionToInMessageCount);
    _.each(keys, (k) => {
      const topicPartition = k.split('-');
      const topic = topicPartition[0];
      const partition = parseInt(topicPartition[1]);
      topicPartitions.push({topic, partition});
    });
    producer.topicPartitions = topicPartitions;
  }
  if(_.isArray(producers)){
    _.each(producers, (producer) => {
      addTopicPartitions(producer);
    });
  }else{
    return addTopicPartitions(producers);
  }
};

const bytesToSize = (bytes) => {
  var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes < 1) {return '0B';}
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + '' + sizes[i];
};

const pushMetricsInPartition = (topics) =>{
  _.each(topics, (topic) => {
    _.each(topic.topicInfo.partitions,(p) => {
      p.metrics = topic.partitionMetrics[p.partition];
      p.topic = topic;
    });
  });
};

const refTopicToPartition = (topics) =>{
  _.each(topics, (topic) => {
    const consumerGroups = [];
    _.each(topic.partitionMetrics,(p, key) => {
      // p.metrics = topic.partitionMetrics[p.partition];
      // p.topic = topic;
      p.aggrTopicPartitionMetrics.topic = topic;

      consumerGroups.push.apply(consumerGroups, _.keys(p.consumerGroupIdToLag));
    });

    topic.consumerGroupsCount = _.uniq(consumerGroups).length;
  });
};

const makeTopicAggregated = (topic) =>{
  const _topic = {};
  _topic.topicInfo = topic;
  return _topic;
};

const setTopicMetrics = (topic, topicMetrics) => {
  topic.bytesInCount = getHighestTimestampValue(topicMetrics.bytesInCount);
  topic.bytesOutCount = getHighestTimestampValue(topicMetrics.bytesOutCount);
  topic.messagesInCount = getHighestTimestampValue(topicMetrics.messagesInCount);
  topic.partitionMetrics = {};
  _.each(topicMetrics.partitionMetrics, (obj, partiton) => {
    topic.partitionMetrics[partiton] = {
      bytesInCount: getHighestTimestampValue(obj.bytesInCount),
      bytesOutCount: getHighestTimestampValue(obj.bytesOutCount),
      messagesInCount: getHighestTimestampValue(obj.messagesInCount)
    };
  });
};

const getItemFromLocalStorage = (name) => {
  let x = localStorage.getItem(name);
  let params = {};
  if( x === undefined || x === null ){
    x = 'LAST_THIRTY_MINUTES';
    setItemToLocalStorage(x);
  }
  let isObject = true, obj;
  try {
    obj = JSON.parse(x);
  } catch(e) {
    isObject = false;
  }
  if(isObject){
    params["from"] = moment(obj.from).toDate().getTime();
    params["to"] = moment(obj.to).toDate().getTime();
  } else {
    params["duration"] = x;
  }
  return params;
};

const setItemToLocalStorage = (date) => {
  localStorage.setItem("dateRange", date);
};

const getConsumerFromConsumerResponse = (data) => {
  const tempPartitions = [];
  _.each(data.consumerGroupInfo.topicPartitionAssignments, (topic, topicName)=>{
    _.each(topic, (partition, paritionNumber) => {
      tempPartitions.push(partition);
    });
  });
  const groupByClientId = _.groupBy(tempPartitions, 'clientId');
  const clients = [];
  _.each(groupByClientId, (grouped, clientId) => {
    let lag = 0;

    _.each(grouped, (clientPartition) => {
      lag += clientPartition.lag;
    });

    clients.push({
      id: clientId,
      lagCount: lag
    });
  });
  return clients;
};

const getProducerFromProducerClient = (data) => {
  const tempPartitions = [];
  _.each(data.wrappedPartitionMetrics, (topic, topicName) => {
    _.each(topic, (partition, paritionNumber) => {
      partition['clientId'] = data.clientId;
      tempPartitions.push(partition);
    });
  });
  const groupedById = _.groupBy(tempPartitions, 'clientId');
  const producers = [];

  _.each(groupedById, (grouped, clientId) => {
    let partitionToInMessageCount = [];

    _.each(grouped, (clientPartition) => {
      partitionToInMessageCount.push(clientPartition.latestOutMessagesCount);
    });

    data.clientId = clientId;
    data.partitionToInMessageCount = partitionToInMessageCount;
    producers.push(data);
  });
  return producers;
};

const getProducerFromConsumerGroupResponse = (data) => {
  const tempPartitions = [];
  _.each(data.wrappedPartitionMetrics, (topic, topicName) => {
    _.each(topic, (partition, paritionNumber) => {
      _.map(_.keys(partition['producerIdToOutMessagesCount']), (id) =>{
        tempPartitions.push({
          clientId: id,
          partition: partition
        });
      });
    });
  });
  const groupedById = _.groupBy(tempPartitions, 'clientId');
  let producers = [];

  _.each(groupedById, (grouped, clientId) => {
    let partitionToInMessageCount = [];

    _.each(grouped, (clientPartition) => {
      partitionToInMessageCount.push(clientPartition.partition.producerIdToOutMessagesCount[clientId]);
    });

    producers.push({
      clientId: clientId,
      partitionToInMessageCount: partitionToInMessageCount
    });

  });

  producers = _.uniqBy(producers, 'clientId');
  return producers;
};

const getProducersFromProducerResponse = (producers) => {
  const _producers = [];
  _.each(producers, (producer) => {
    _producers.push.apply(_producers, getProducerFromProducerClient(producer));
  });
  return _producers;
};

const getConsumersFromProducerClient = (data) => {
  let tempClients = [];
  const tempPartitions = [];
  _.each(data.wrappedPartitionMetrics, (topic, topicName) => {
    _.each(topic, (partition, paritionNumber) => {
      _.each(_.keys(partition.consumerGroupIdToLag), (id) => {
        tempPartitions.push({
          id: id,
          lagCount: partition.consumerGroupIdToLag[id]
        });
      });
    });
  });
  const groupById = _.groupBy(tempPartitions, 'id');
  _.each(groupById, (grouped, id) => {
    let lag = 0;
    _.each(grouped, (clientPartition) => {
      lag += clientPartition.lagCount;
    });
    tempClients.push({
      id: id,
      lagCount: lag
    });
  });
  return tempClients;
};

const getProducersFromTopicResponse = (data) => {
  let tempPartitions = [];
  let producers = [];
  _.each(data.partitionMetrics, (p, pName) => {
    _.each(_.keys(p.producerIdToOutMessagesCount), (id) => {
      tempPartitions.push({
        clientId: id,
        producerIdToOutMessagesCount: p.producerIdToOutMessagesCount[id]
      });
    });
  });
  let groupedById = _.groupBy(tempPartitions, "clientId");
  _.each(groupedById, (grouped, id) => {
    let partitionToInMessageCount = [];

    _.each(grouped, (clientPartition) => {
      partitionToInMessageCount.push(clientPartition.producerIdToOutMessagesCount);
    });

    producers.push({
      clientId: id,
      partitionToInMessageCount: partitionToInMessageCount
    });
  });
  return producers;
};

const getConsumersFromTopicResponse = (data) => {
  let tempClients = [];
  const tempPartitions = [];
  _.each(data.partitionMetrics, (p, pName) => {
    _.each(_.keys(p.consumerGroupIdToLag), (id) => {
      tempPartitions.push({
        id: id,
        lagCount: p.consumerGroupIdToLag[id]
      });
    });
  });
  const groupById = _.groupBy(tempPartitions, 'id');
  _.each(groupById, (grouped, id) => {
    let lag = 0;
    _.each(grouped, (clientPartition) => {
      lag += clientPartition.lagCount;
    });
    tempClients.push({
      id: id,
      lagCount: lag
    });
  });
  return tempClients;
};

const getProducerFromBrokerResponse = (data) => {
  let producers = [];

  let groupedById = _.groupBy(data, "producerName");
  _.each(groupedById, (grouped, id) => {
    let partitionToInMessageCount = [];
    let active = false;

    _.each(grouped, (p) => {
      partitionToInMessageCount.push(p.messageCount);
      active = p.active;
    });

    producers.push({
      clientId: id,
      partitionToInMessageCount: partitionToInMessageCount,
      active: active
    });
  });
  return producers;
};

const getConsumersFromBrokerResponse = (data) => {
  let consumers = [];
  const groupById = _.groupBy(data, 'consumerGroupName');
  _.each(groupById, (grouped, id) => {
    let lag = 0;
    let active = false;
    let state = '';
    _.each(grouped, (c) => {
      lag += c.lag;
      active = c.active;
      state = c.state;
    });
    consumers.push({
      lagCount: lag,
      consumerGroupInfo: {
        id: id,
        active: active,
        state: state
      }
    });
  });
  return consumers;
};

const brokerTopicSync = (brokers, topics) => {
  const allPartitions = [];
  const allReplicas = [];

  _.each(topics, (topic) => {
    _.each(topic.partitionMetrics, (partition) => {

      allPartitions.push({
        detail: partition.aggrTopicPartitionMetrics,
        topic: topic
      });

      _.each(partition.aggrTopicPartitionMetrics.partitionInfo.replicas, (replica) => {
        allReplicas.push({
          detail: replica,
          partition: partition,
          topic: topic
        });
      });

    });
  });

  const partitionGroupedById = _.groupBy(allPartitions, (partition) => {
    return partition.detail.partitionInfo.leader.id;
  });

  const replicaGroupedById = _.groupBy(allReplicas, (replica) => {
    return replica.detail.id;
  });

  _.each(brokers, (broker) => {
    broker.partitions = partitionGroupedById[broker.node.id] || [];
    broker.replicas = replicaGroupedById[broker.node.id] || [];
  });
};

const getProducersFromAggregatedTopics = (topics) => {
  _.each(topics, (t) => {
    t.producers = getProducersFromTopicResponse(t);
  });
};

const getConsumersFromAggregatedTopics = (topics) => {
  _.each(topics, (t) => {
    t.consumers = getConsumersFromTopicResponse(t);
  });
};

const topicSorting = (arr, obj) => {
  let sorted = arr, searchType = obj.attr;
  if(searchType == 'partitions'){
    sorted = arr.sort((a, b) => {
      const a_keys = _.keys(a.partitionMetrics);
      const b_keys = _.keys(b.partitionMetrics);
      let res = b_keys.length - a_keys.length;
      if(res == 0){
        res = b.name.localeCompare(a.name);
      }
      return res;
    });
    if(obj.type === "asc" || obj.type === ''){
      sorted = sorted;
    }else{
      sorted = sorted.reverse();
    }
  } else if(searchType == 'consumerGroupsCount') {
    sorted = arr.sort((a, b) => {
      let res = b.consumerGroupsCount - a.consumerGroupsCount;
      if(res == 0){
        res = b.name.localeCompare(a.name);
      }
      return res;
    });
    if(obj.type === "asc" || obj.type === ''){
      sorted = sorted;
    }else{
      sorted = sorted.reverse();
    }
  } else {
    sorted = sortArray(arr, searchType, obj.type === 'asc' || obj.type === ''  ? true : false);
  }
  return sorted;
};

const brokerSorting = (arr, obj) => {
  let sorted = arr, searchType = obj.attr;
  if(searchType !== 'partitions' && searchType !== 'replicas'){
    sorted = sortArray(arr, searchType, obj.type === 'asc' || obj.type === ''  ? true : false);
  } else {
    sorted = arr.sort((a, b) => {
      const a_keys = a[searchType].length;
      const b_keys =  b[searchType].length;
      let res = b_keys - a_keys ;
      if(res == 0){
        res = b.node.id - a.node.id;
      }
      return res;
    });
    if(obj.type === "asc" || obj.type === ''){
      sorted = sorted;
    }else{
      sorted = sorted.reverse();
    }
  }
  return sorted;
};

const sidePanelSorting = (arr, obj) => {
  let sorted = arr, searchType = obj.attr;
  sorted = sortArray(arr, searchType, obj.type === 'asc' || obj.type === ''  ? true : false);
  return sorted;
};

const getTimeString = (ms) => {
  const _data = moment.duration(ms)._data;

  const days = _data.days,
    hours = _data.hours,
    minutes = _data.minutes,
    seconds = _data.seconds;

  const removeZeroValues = (arr) => {
    for(let i = 0;i <= arr.length-1;){
      const obj = arr[i];
      if(obj.val == 0 && arr.indexOf(obj) == 0){
        arr.splice(i, 1);
      }else{
        break;
      }
    }
    for(let i = arr.length-1;i >= 0;){
      const obj = arr[i];
      if(obj.val == 0 && arr.indexOf(obj) == arr.length-1){
        arr.splice(i, 1);
        i--;
      }else{
        break;
      }
    }
  };

  const stringArr = [
    {
      val: days,
      label: days == 1 ? 'day' : 'days'
    },
    {
      val: hours,
      label: hours == 1 ? 'hr' : 'hrs'
    },
    {
      val: minutes,
      label: minutes == 1 ? 'min' : 'mins'
    },
    {
      val: seconds,
      label: seconds == 1 ? 'sec' : 'secs'
    }
  ];

  removeZeroValues(stringArr);

  return _.map(stringArr, (s) => {
    return s.val + ' ' + s.label;
  }).join(' ') || '0 secs';
};

const origin = window.location.origin;

const getGrafanaTopicUrl = (hostPort = (origin+'/grafana'), topicName) => {
  return hostPort + `/dashboard/db/kafka-topics?var-Topics=${topicName}`;
};
const getGrafanaBrokerUrl = (hostPort = (origin+'/grafana'), brokerHost) => {
  return hostPort + `/dashboard/db/kafka-hosts?var-hosts=${brokerHost}`;
};
const getAtlasTopicUrl = (hostPort = (origin+'/atlas'), topicName) => {
  return hostPort + `/index.html#!/search/searchResult?query=name%3D${topicName}&type=kafka_topic&searchType=dsl&dslChecked=true`;
};
const getAmbariBrokerUrl = (hostPort = (origin+'/ambari'), brokerHost) => {
  return hostPort + `/#/main/hosts/${brokerHost}/summary`;
};

export default {
  sortArray,
  numberToMilliseconds,
  millisecondsToNumber,
  capitaliseFirstLetter,
  splitTimeStamp,
  splitSeconds,
  filterByName,
  ellipses,
  secToMinConverter,
  kFormatter,
  convertMillsecondsToSecond,
  isMergeableObject,
  emptyTarget,
  cloneIfNecessary,
  defaultArrayMerge,
  mergeObject,
  deepmerge,
  deepmergeAll,
  checkTypeAndReturnValue,
  customFetch,
  checkStatus,
  checkStatusForResponseText,
  matchStringInArr,
  noSpecialCharString,
  abbreviateNumber,
  formatLatency,
  setTimoutFunc,
  removeSpecialCharToSpace,
  addLagCountInConsumers,
  getHighestTimestampValue,
  getTableRowData,
  addProducerTopicPartitions,
  bytesToSize,
  pushMetricsInPartition,
  getItemFromLocalStorage,
  setItemToLocalStorage,
  makeTopicAggregated,
  setTopicMetrics,
  getConsumerFromConsumerResponse,
  getProducerFromProducerClient,
  getProducerFromConsumerGroupResponse,
  getConsumersFromProducerClient,
  refTopicToPartition,
  getProducersFromTopicResponse,
  getConsumersFromTopicResponse,
  getProducersFromProducerResponse,
  brokerTopicSync,
  getProducersFromAggregatedTopics,
  getConsumersFromAggregatedTopics,
  topicSorting,
  brokerSorting,
  sidePanelSorting,
  isFloat,
  isInteger,
  getProducerFromBrokerResponse,
  getConsumersFromBrokerResponse,
  getTimeString,
  getGrafanaTopicUrl,
  getGrafanaBrokerUrl,
  getAtlasTopicUrl,
  getAmbariBrokerUrl,
  showResponseError
};
