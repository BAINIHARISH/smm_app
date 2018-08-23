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
import React, { Component } from 'react';
import routes from './routers/routes';
import { render } from 'react-dom';
import { Router, browserHistory, hashHistory } from 'react-router';
import _ from 'lodash';
import { toastOpt, unknownAccessCode, updateBaseUrl ,updateRestUrl } from './utils/Constants';
import app_state from './app_state';
import CommonNotification from './utils/CommonNotification';
import {observer} from 'mobx-react';
import PropTypes from 'prop-types';
import ClusterREST from 'rest/ClusterREST';
import FSReactToastr from './components/CommonComponent/FSReactToastr' ;
import Header from './components/Site/Header' ;
import Sidebar from './components/Site/Sidebar' ;
import ClusterNotFound from './components/CommonComponent/ClusterNotFoundPage' ;

@observer
class App extends Component {

  constructor(){
    super();

    this.state = {
      showLoading: true,
      clusters: [],
      selectedCluster: {
        ambariUrl: null
      },
      clusterName: 'None',
      identity: {},
      grafanaUrl: null,
      smmUrl: null,
      atlasUrl: null
    };
  }
  componentDidMount(){
    this.fetchClusters();
  }
  fetchClusters(){
    const PromiseArr = [];

    const showClusterError = () => {
      FSReactToastr.error(<CommonNotification flag="error" content={'Please enable a DPS managed cluster for SMM app'}/>, '', toastOpt);
    };

    const state = this.state;

    PromiseArr.push(ClusterREST.getLakes({
      plugin: 'smm'
    }).then((res) => {
      const clusters = res;
      if(_.isEmpty(clusters)){
        showClusterError();
      }

      const selectedClusterName = localStorage.getItem('smm_selected_cluster');

      let selectedCluster;
      if(selectedClusterName){
        selectedCluster = _.find(clusters, (c) => {
          return c.id == selectedClusterName;
        });
        if(!selectedCluster){
          selectedCluster = clusters[0];
        }
      } else {
        selectedCluster = clusters[0];
      }

      this.setState({clusters}, () => {
        this.onSelectCluster(selectedCluster);
      });
    }, (err) => {
      showClusterError();
    }));

    PromiseArr.push(ClusterREST.getIdentity().then((res) => {
      this.setState({identity: res});
    }, (err) => {
      FSReactToastr.error(<CommonNotification flag="error" content={'Failed to load user'}/>, '', toastOpt);
    }));

    Promise.all(PromiseArr).then((ress) => {
    }, (err) => {
      state.showLoading = false;
      this.setState(state);
    });
  }
  onSelectCluster(cluster){
    this.setState({showLoading: true}, () => {
      ClusterREST.getCluster({
        dpClusterId: cluster.id,
        plugin: 'smm'
      }).then((cluster_res) => {
        cluster_res = cluster_res[0];

        const PromiseArr = [];

        PromiseArr.push(ClusterREST.getServices(cluster_res.id, {
          serviceName: 'AMBARI_METRICS'
        }, {}).then((json) => {
          let grafanaUrl = null;

          if(json.length > 0) {
            const amsGrafanaIni = json[0].properties.find(cProp => cProp.type === 'ams-grafana-ini');
            if(amsGrafanaIni){
              const props = amsGrafanaIni.properties;
              grafanaUrl = `${props.protocol}://${json[0].hosts[0]}:${props.port}`;
            }
          }
          this.setState({
            grafanaUrl: grafanaUrl
          });
        }));

        PromiseArr.push(ClusterREST.getServices(cluster_res.id, {
          serviceName: 'STREAMSMSGMGR'
        }, {}).then((json) => {
          let smmUrl = null;

          if(json.length > 0) {
            const sslConfig = json[0].properties.find(cProp => cProp.type === 'streams-messaging-manager-ssl-config');
            const common = json[0].properties.find(cProp => cProp.type === 'streams-messaging-manager-common');
            
            if(sslConfig && common){
              const protocol = sslConfig.properties["streams_messaging_manager.ssl.isenabled"] == 'true' ? 'https': 'http';
              const portWithoutSSL = common.properties.port;
              const portWithSSL = common.properties["streams_messaging_manager.ssl.port"];

              smmUrl = `${protocol}://${json[0].hosts[0]}:${protocol === 'https' ? portWithSSL : portWithoutSSL}`;
            }
          }
          this.setState({
            smmUrl: smmUrl
          });
          updateBaseUrl(cluster_res.id);
          updateRestUrl(smmUrl);
        }));

        PromiseArr.push(ClusterREST.getServices(cluster_res.id, {
          serviceName: 'ATLAS'
        }, {}).then((json) => {
          let atlasUrl = null;

          if(json.length > 0) {
            const appProps = json[0].properties.find(cProp => cProp.type === 'application-properties');
            if(appProps){
              const props = appProps.properties;
              atlasUrl = props['atlas.rest.address'];
            }
          }
          this.setState({
            atlasUrl: atlasUrl
          });
        }));

        Promise.all(PromiseArr).then((res) => {
          this.setState({selectedCluster: cluster, showLoading: false},() => {
            localStorage.setItem('smm_selected_cluster', cluster.id);
          });
        }, (err) => {
          FSReactToastr.error(<CommonNotification flag="error" content={err.message}/>, '', toastOpt);
        });
      }, (err) => {
        FSReactToastr.error(<CommonNotification flag="error" content={err.message}/>, '', toastOpt);
      });
    });
  }
  getChildContext() {
    return {App: this};
  }
  onClusterChange = (k) => {
    const {clusters} = this.state;
    if(k) {
      const selectedCluster = _.find(clusters, (c) => {
        return c.id == k;
      });
      if(selectedCluster){
        this.onSelectCluster(selectedCluster);
      }
    } else {
      this.setState({clusterName: 'None'});
    }
  }
  onLogout(){
    ClusterREST.authOut().then((res) => {
      const challengeAt = res.headers.get('X-Authenticate-Href');
      if(challengeAt){
        const redirectTo = `${window.location.protocol}//${window.location.host}/${challengeAt}`;
        window.location.href = `${redirectTo}?originalUrl=${window.location.protocol}//${window.location.host}/`;
      }
    }, (err) => {
      FSReactToastr.error(<CommonNotification flag="error" content={err.message}/>, '', toastOpt);
    });
  }
  render() {
    const {showLoading, clusters, identity, selectedCluster} = this.state;

    const mainComp = clusters.length ? <Router ref="router" history={hashHistory} routes={routes} key="router"/> : <ClusterNotFound key="clusterNotFound"/>;

    const loader = <div className="loading" key="loading"></div>;

    const component = [
      <Header key="header" identity={identity} selectedCluster={selectedCluster}/>,
      <Sidebar key="sidebar"/>,
      showLoading ? loader : mainComp
    ];

    return <div>
      {component}
      <div className="kafka-graph-overlay-container displayNone"></div>
    </div>;
  }
}

App.childContextTypes = {
  App: PropTypes.object
};

export default App;
