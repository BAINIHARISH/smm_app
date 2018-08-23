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
import { Router, Route, hashHistory, browserHistory, IndexRoute } from 'react-router';
import state from '../app_state';
import Overview from '../components/Overview';
import TopicDetails from '../components/Topics/TopicDetails';
import Topics from '../components/Topics';
import Producers from '../components/Producers';
import Brokers from '../components/Brokers';
import Consumers from '../components/Consumers';
import ConsumersDetails from '../components/Consumers/ConsumersDetails';
import ProducersDetails from '../components/Producers/ProducerDetails';
import BrokerDetails from '../components/Brokers/BrokerDetails';

const onEnter = (nextState, replace, callback) => {
  var sidebarRoute = nextState.routes[1];
  if (sidebarRoute) {
    if (sidebarRoute.name === 'Overview') {
      state.sidebar_activeKey = 1;
    } else if (sidebarRoute.name === 'Topics') {
      state.sidebar_activeKey = 3;
    } else if (sidebarRoute.name === 'Brokers') {
      state.sidebar_activeKey = 2;
    } else if (sidebarRoute.name === 'Producers') {
      state.sidebar_activeKey = 4;
    } else if (sidebarRoute.name === 'Consumers') {
      state.sidebar_activeKey = 5;
    } else {
      state.sidebar_activeKey = 6;
    }
  }
  callback();
};

export default (
  <Route path="/" component={null} name="Home" onEnter={onEnter}>
    <IndexRoute name="Overview" component={Overview} onEnter={onEnter} />
    <Route path="topics" name="Topics" onEnter={onEnter}>
      <IndexRoute name="Topics"  component={Topics} onEnter={onEnter} />
      <Route path=":topicname" name="Data Explorer"  component={TopicDetails} onEnter={onEnter}/>
    </Route>
    <Route path="consumers" name="Consumers" onEnter={onEnter}>
      <IndexRoute name="Consumers"  component={Consumers} onEnter={onEnter} />
      <Route path=":id" name="Consumer Details"  component={ConsumersDetails} onEnter={onEnter}/>
    </Route>
    <Route path="producers" name="Producers" onEnter={onEnter}>
      <IndexRoute name="Producers"  component={Producers} onEnter={onEnter} />
      <Route path=":id" name="Producer Details"  component={ProducersDetails} onEnter={onEnter}/>
    </Route>
    <Route path="brokers" name="Brokers" onEnter={onEnter}>
      <IndexRoute name="Brokers"  component={Brokers} onEnter={onEnter} />
      <Route path=":brokerid" name="Broker Details"  component={BrokerDetails} onEnter={onEnter}/>
    </Route>
  </Route>
);
