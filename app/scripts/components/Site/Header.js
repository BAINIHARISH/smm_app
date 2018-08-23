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
import {Switcher} from 'dps-apps';
import {Link} from 'react-router';
import app_state from '../../app_state';
import {observer} from 'mobx-react';
import {Nav, Navbar, NavItem, NavDropdown, MenuItem,DropdownButton} from 'react-bootstrap';
import _ from 'lodash';

@observer
export default class Header extends Component {

  constructor(props) {
    super();
    this.state = {};
  }

  componentDidMount(){
    Switcher.init({
      srcElement: this.SwitcherRef
    });
  }

  render() {
    const app = this.context.App;
    const titleContent = (<a>{app.state.selectedCluster.name || 'none'}</a>);
    const usersIcon = <i className="fa fa-user"></i>;
    return (
      <header className="main-header">
        <div
          ref={(ref)=> {
            this.SwitcherRef = ref;
          }}
          className="logo"
        >
          <span className="logo-mini" style={{textAlign: 'center'}}>
            <img src="styles/img/icon-SMM-color.png" data-stest="logo-collapsed" width="70%"/>
          </span>
          <span className="logo-lg">
            <img src="styles/img/icon-SMMname-color.png" data-stest="logo-expanded" width="90%"/>
          </span>
        </div>
        <nav className="navbar navbar-default navbar-static-top">
          <div>
            <div className="headContentText">
              {app_state.headerContent}
            </div>
            <ul className="nav pull-right"  id="actionProfileDropdown" >
              <li className="">
                Cluster:
                <DropdownButton
                  onSelect={app.onClusterChange}
                  title={titleContent}
                  className="dropdown-toggle"
                  bsStyle="link"
                  id="cluster-dropdown"
                  pullRight
                >
                  {
                    app.state.clusters.length ?
                    app.state.clusters.map((c)=>{
                      const clusterId = c.id;
                      const clusterName = c.name;
                      return <MenuItem key={clusterId} eventKey={clusterId} className={app.state.selectedCluster.id === clusterId ? "active" : ""}>{clusterName}</MenuItem>;
                    })
                    : <MenuItem>No data</MenuItem>
                  }
                </DropdownButton>
              </li>
              <li className="user-dropdown">
                <DropdownButton
                  title={<i className="fa fa-user"></i>}
                  className="dropdown-toggle"
                  bsStyle="link"
                  id="profile-dropdown"
                  pullRight
                >
                    <span className="username">{app.state.identity.username}</span>
                    <MenuItem className="logout" onClick={app.onLogout}>Logout</MenuItem>
                </DropdownButton>
              </li>
            </ul>
          </div>
        </nav>

      </header>
    );
  }
}

Header.contextTypes = {
  App: PropTypes.object
};
