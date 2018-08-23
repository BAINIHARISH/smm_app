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

import fetch from 'isomorphic-fetch';
import {
  baseUrl
} from '../utils/Constants';
import Utils from '../utils/Utils';
const {checkStatus, customFetch} = Utils;
import jQuery from 'jquery';
import _ from 'lodash';
const metrics = 'metrics';

const MetricsREST = {
  getTopicsMetrics(topicName,params,options) {
    options = options || {};
    options.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';

    const q_params = jQuery.param(params, true);
    return customFetch(baseUrl + metrics +'/topics/'+topicName+'?'+q_params ,options)
      .then(checkStatus);
  },
  getBrokersMetrics(brokerId,params,options) {
    options = options || {};
    options.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';

    const q_params = jQuery.param(params, true);
    return customFetch(baseUrl + metrics +'/brokers/'+brokerId+'?'+q_params ,options)
      .then(checkStatus);
  },
  getProducersMetrics(options){
    options = options || {};
    options.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';

    const url = baseUrl + metrics +'/producers';
    // const url = baseUrl +'/topics';
    return customFetch(url, options)
      .then(checkStatus)
      // .then((res) => {
      //   const response = [{"clientId":"TestProducer","inMessagesCount":{"TopicPartition{partition=1, topic='test'}":{"1523956481559":0.6673078666120574},"TopicPartition{partition=0, topic='test'}":{"1523956481555":0.7087386224171169},"TopicPartition{partition=3, topic='test'}":{"1523956481566":0.5566632360418337},"TopicPartition{partition=2, topic='test'}":{"1523956481561":0.47455526049071217},"TopicPartition{partition=5, topic='test'}":{"1523956481571":0.7579460329761254},"TopicPartition{partition=4, topic='test'}":{"1523956481569":0.16935966460843865},"TopicPartition{partition=7, topic='test'}":{"1523956481575":0.7472498678933698},"TopicPartition{partition=6, topic='test'}":{"1523956481573":0.6200504554248443},"TopicPartition{partition=9, topic='test'}":{"1523956481579":0.7179003003901444},"TopicPartition{partition=8, topic='test'}":{"1523956481577":0.6566645451986206}}},{"clientId":"FooProducer","inMessagesCount":{"TopicPartition{partition=6, topic='foo'}":{"1523956481597":0.41447462650686107},"TopicPartition{partition=7, topic='foo'}":{"1523956481599":0.49334900618540145},"TopicPartition{partition=4, topic='foo'}":{"1523956481592":0.2707262380023264},"TopicPartition{partition=5, topic='foo'}":{"1523956481595":0.8892818248105729},"TopicPartition{partition=2, topic='foo'}":{"1523956481588":0.5822179931272372},"TopicPartition{partition=3, topic='foo'}":{"1523956481590":0.4239905655902638},"TopicPartition{partition=0, topic='foo'}":{"1523956481583":0.37698668025488036},"TopicPartition{partition=1, topic='foo'}":{"1523956481586":0.523357591157948},"TopicPartition{partition=8, topic='foo'}":{"1523956481602":0.6885143910849783},"TopicPartition{partition=9, topic='foo'}":{"1523956481604":0.2570703952330722}}}];
      //   return response;
      // })
      .then((response) => {
        Utils.addProducerTopicPartitions(response);
        return response;
      });
  },
  getProducerMetrics(clientId, options){
    options = options || {};
    options.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';

    const url = baseUrl + metrics +'/producers/'+clientId;
    // const url = baseUrl +'topics';
    return customFetch(url, options)
      .then(checkStatus)
      // .then((res) => {
      //   const response = [{"clientId":"TestProducer","inMessagesCount":{"TopicPartition{partition=1, topic='test'}":{"1523956481559":0.6673078666120574},"TopicPartition{partition=0, topic='test'}":{"1523956481555":0.7087386224171169},"TopicPartition{partition=3, topic='test'}":{"1523956481566":0.5566632360418337},"TopicPartition{partition=2, topic='test'}":{"1523956481561":0.47455526049071217},"TopicPartition{partition=5, topic='test'}":{"1523956481571":0.7579460329761254},"TopicPartition{partition=4, topic='test'}":{"1523956481569":0.16935966460843865},"TopicPartition{partition=7, topic='test'}":{"1523956481575":0.7472498678933698},"TopicPartition{partition=6, topic='test'}":{"1523956481573":0.6200504554248443},"TopicPartition{partition=9, topic='test'}":{"1523956481579":0.7179003003901444},"TopicPartition{partition=8, topic='test'}":{"1523956481577":0.6566645451986206}}},{"clientId":"FooProducer","inMessagesCount":{"TopicPartition{partition=6, topic='foo'}":{"1523956481597":0.41447462650686107},"TopicPartition{partition=7, topic='foo'}":{"1523956481599":0.49334900618540145},"TopicPartition{partition=4, topic='foo'}":{"1523956481592":0.2707262380023264},"TopicPartition{partition=5, topic='foo'}":{"1523956481595":0.8892818248105729},"TopicPartition{partition=2, topic='foo'}":{"1523956481588":0.5822179931272372},"TopicPartition{partition=3, topic='foo'}":{"1523956481590":0.4239905655902638},"TopicPartition{partition=0, topic='foo'}":{"1523956481583":0.37698668025488036},"TopicPartition{partition=1, topic='foo'}":{"1523956481586":0.523357591157948},"TopicPartition{partition=8, topic='foo'}":{"1523956481602":0.6885143910849783},"TopicPartition{partition=9, topic='foo'}":{"1523956481604":0.2570703952330722}}}];
      //   return response[0];
      // })
      .then((response) => {
        Utils.addProducerTopicPartitions(response);
        return response;
      });
  },
  getAggregatedTopics(params, options) {
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';
    params = Object.assign({},params);
    if(!_.has(params, 'state')){
      params.state = 'all';
    }
    const q_params = jQuery.param(params, true);
    return customFetch(baseUrl + 'metrics/aggregated/topics?'+q_params, options)
      .then(checkStatus);
  },
  getAggregatedTopicMetrics(topicName, params, options) {
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';
    params = Object.assign({},params);
    if(!_.has(params, 'state')){
      params.state = 'all';
    }
    const q_params = jQuery.param(params, true);
    return customFetch(baseUrl + 'metrics/aggregated/topics/' + topicName + '?'+q_params, options)
      .then(checkStatus);
  },
  getAggregatedBrokers(params, options) {
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';
    const q_params = jQuery.param(params, true);
    return customFetch(baseUrl + 'metrics/aggregated/brokers?' + q_params, options)
      .then(checkStatus);
  },
  getAggregatedBrokerMetrics(brokerId, params, options) {
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';
    const q_params = jQuery.param(params, true);
    return customFetch(baseUrl + 'metrics/aggregated/brokers/' + brokerId + '?'+q_params, options)
      .then(checkStatus);
  },
  getAggregatedProducers(params, options) {
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';
    params = Object.assign({},params);
    if(!_.has(params, 'state')){
      params.state = 'all';
    }
    const q_params = jQuery.param(params, true);
    return customFetch(baseUrl + 'metrics/aggregated/producers?' + q_params, options)
      .then(checkStatus)
      .then((response) => {
        Utils.addProducerTopicPartitions(response);
        return response;
      });
  },
  getAggregatedConsumers(params, options) {
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';
    params = Object.assign({},params);
    if(!_.has(params, 'requireTimelineMetrics')){
      params.requireTimelineMetrics = false;
    }
    if(!_.has(params, 'state')){
      params.state = 'all';
    }
    const q_params = jQuery.param(params, true);
    return customFetch(baseUrl + 'metrics/aggregated/groups?' + q_params, options)
      .then(checkStatus);
  },
  getAggregatedConsumerGroup(groupName, params, options) {
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';
    params = Object.assign({},params);
    if(!_.has(params, 'requireTimelineMetrics')){
      params.requireTimelineMetrics = false;
    }
    if(!_.has(params, 'state')){
      params.state = 'all';
    }
    const q_params = jQuery.param(params, true);
    return customFetch(baseUrl + 'metrics/aggregated/groups/'+ groupName +'?' + q_params, options)
      .then(checkStatus);
  },
  getGroupPartitionMetrics(groupName, params, options){
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';
    const q_params = jQuery.param(params, true);
    return customFetch(baseUrl + 'metrics/consumers/group/'+ groupName +'?' + q_params, options)
      .then(checkStatus);
  },
  getAggregatedProducerClient(producerClientId  , params, options) {
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';
    const q_params = jQuery.param(params, true);
    return customFetch(baseUrl + 'metrics/aggregated/producers/'+ producerClientId  +'?' + q_params, options)
      .then(checkStatus);
  }
};

export default MetricsREST;
