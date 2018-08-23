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
import {NavItem} from 'react-bootstrap';
import app_state from '../../app_state';
import {observer} from 'mobx-react';
import {menuName} from '../../utils/Constants';

@observer
export default class Sidebar extends Component {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    /*var element = document.getElementsByTagName('body')[0];
    element.classList.add('sidebar-mini');
    if (app_state.sidebar_isCollapsed) {
      element.classList.add('sidebar-collapse');
    }*/
  }
  componentDidUpdate() {
    var element = document.getElementsByTagName('body')[0];
    if (app_state.sidebar_isCollapsed) {
      element.classList.add('sidebar-collapse');
    } else {
      element.classList.remove('sidebar-collapse');
    }
  }
  toggleSidebar() {
    const alphaIcon = document.querySelector('.alpha-icon');
    app_state.sidebar_isCollapsed = !app_state.sidebar_isCollapsed;
  }
  toggleMenu() {
    if (app_state.sidebar_isCollapsed) {
      return;
    }
    app_state.sidebar_activeKey = app_state.sidebar_toggleFlag
      ? ''
      : 3;
    app_state.sidebar_toggleFlag = !app_state.sidebar_toggleFlag;
  }
  handleClick(key, e) {
    app_state.sidebar_activeKey = key;
    if (key === 3) {
      app_state.sidebar_toggleFlag = true;
    } else {
      app_state.sidebar_toggleFlag = false;
    }
  }
  render() {
    return (
      <aside className="main-sidebar">
        <section className="sidebar">
          <ul className="sidebar-menu">
            <li className={app_state.sidebar_activeKey === 1
              ? 'active'
              : ''} onClick={this.handleClick.bind(this, 1)}>
              <a href="#/">
                <i className="fa fa-dashboard"></i>
                <span>Overview</span>
              </a>
            </li>
            <li className={app_state.sidebar_activeKey === 2
              ? 'active'
              : ''} onClick={this.handleClick.bind(this, 2)}>
              <a href="#/brokers">
                <i className="fa fa-server"></i>
                <span>Brokers</span>
              </a>
            </li>
            <li className={app_state.sidebar_activeKey === 3
              ? 'active'
              : ''} onClick={this.handleClick.bind(this, 3)}>
              <a href="#/topics">
                <i className="fa fa-database"></i>
                <span>Topics</span>
              </a>
            </li>
            <li className={app_state.sidebar_activeKey === 4
              ? 'active'
              : ''} onClick={this.handleClick.bind(this, 4)}>
              <a href="#/producers">
                <i className="fa fa-sign-out"></i>
                <span>Producers</span>
              </a>
            </li>
            <li className={app_state.sidebar_activeKey === 5
              ? 'active'
              : ''} onClick={this.handleClick.bind(this, 5)}>
              <a href="#/consumers">
                <i className="fa fa-sign-in"></i>
                <span>Consumer Groups</span>
              </a>
            </li>
            {/*<li className={app_state.sidebar_activeKey === 6
              ? 'active'
              : ''} onClick={this.handleClick.bind(this, 6)}>
              <Link to="/settings">
                <i className="fa fa-wrench"></i>
                <span>Settings</span>
              </Link>
            </li>*/}
          </ul>
        </section>
        <a href="javascript:void(0);" className="sidebar-toggle" onClick={this.toggleSidebar.bind(this)} data-toggle="offcanvas" role="button">
          <i className={app_state.sidebar_isCollapsed
            ? "fa fa-angle-double-right"
            : "fa fa-angle-double-left"}></i>
        </a>
      </aside>
    );
  }
}
