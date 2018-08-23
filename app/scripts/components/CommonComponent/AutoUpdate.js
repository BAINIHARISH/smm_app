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
import moment from 'moment';

class AutoUpdate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lastUpdated: moment()
    };
  }

  componentDidMount(){}

  componentDidUpdate(){
    const {textUpdateTimeout} = this.props;

    window.clearTimeout(this.textChangeTimeout);

    this.textChangeTimeout = setTimeout(() => {
      const {updating, updatedTime, updateCallbackInterval, updateCallback} = this.props;
      if(!updating){
        const now = moment();
        this.setState({
          lastUpdated: now
        }, () => {
          const timeDiff = now.diff(updatedTime);
          if(timeDiff >= updateCallbackInterval){
            updateCallback();
          }
        });
      }
    }, textUpdateTimeout);
  }

  componentWillUnmount(){
    window.clearTimeout(this.textChangeTimeout);
  }

  render() {
    const {updating, updatedTime, updateCallbackInterval, updateCallback, showText} = this.props;

    const updateText = 'Updated ' + updatedTime.fromNow();

    const style= {
      fontSize: '10px',
      color: 'grey',
      marginRight: '10px'
    };

    if(showText){
      return (<span style={style}>
        { updating ? 'Updating...' : updateText }
      </span>);
    }else{
      return null;
    }

  }
}

AutoUpdate.defaultProps = {
  showText: false,
  textUpdateTimeout: 60000,
  updatedTime: moment(),
  updating: false,
  updateCallbackInterval: 60000*3,
  updateCallback: () => { }
};

export default AutoUpdate;
