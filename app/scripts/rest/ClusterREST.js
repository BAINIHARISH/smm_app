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
import _ from 'lodash';
import Utils from '../utils/Utils';
import jQuery from 'jquery';
const {checkStatus} = Utils;

const ClusterREST = {
  getIdentity(options){
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';

    return fetch('/api/identity', options)
      .then(checkStatus);
  },
  authOut(options){
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';

    return fetch('/auth/out', options);
  },
  getLakes(params, options){
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';

    const q_params = jQuery.param(params, true);

    return fetch('/api/lakes?'+q_params, options)
      .then(checkStatus);
  },
  getCluster(params, options) {
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';

    const q_params = jQuery.param(params, true);
    return fetch('/api/clusters?'+q_params, options)
      .then(checkStatus);
  },
  getServices(id, params, options) {
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';

    const q_params = jQuery.param(params, true);
    return fetch('/api/clusters/'+id+'/services?'+q_params, options)
      .then(checkStatus);
  },
  getServiceConfigVersions(id, name, params, options){
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';

    const _params = Object.assign({}, params);
    if(!_.has(_params, 'service_name')){
      _params.service_name = 'STREAMSMSGMGR';
    }
    if(!_.has(_params, 'is_current')){
      _params.is_current = true;
    }
    const q_params = jQuery.param(_params, true);

    return fetch('/cluster/cluster/'+id+'/service/ambari/api/v1/clusters/'+name+'/configurations/service_config_versions?'+q_params, options)
      .then(checkStatus);
  },
  getHostComponents(id, name, params, options){
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';

    const _params = Object.assign({}, params);
    if(!_.has(_params, 'HostRoles/component_name')){
      _params['HostRoles/component_name'] = 'STREAMSMSGMGR';
    }
    const q_params = jQuery.param(_params, true);

    return fetch('/cluster/cluster/'+id+'/service/ambari/api/v1/clusters/'+name+'/host_components?'+q_params, options)
      .then(checkStatus);
  }
};

export default ClusterREST;
