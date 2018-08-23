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
import _ from 'lodash';
import {MenuItem,DropdownButton} from 'react-bootstrap';
import moment from 'moment';
import DateTimePickerDropdown from './DateTimePickerDropdown';


export default class TabSideComponent extends Component{
  constructor(props){
    super(props);
  }

  onDropdownSelect= (eventKey) => {
    console.log(eventKey);
  }

  datePickerCallback = (startDate, endDate) => {
    this.setState({
      activePage: 1
    }, () => {
      this.props.datePickerHandler(startDate, endDate);
    });
  }

  render(){
    const {viewMode, grafanaUrlCallback, atlasUrlCallback, ambariUrlCallback} = this.props;
    const {startDate,endDate} = this.props;
    const locale = {
      format: 'YYYY-MM-DD HH:mm:ss',
      separator: ' - ',
      applyLabel: 'Apply',
      cancelLabel: 'Cancel',
      weekLabel: 'W',
      customRangeLabel: 'Custom Range',
      daysOfWeek: moment.weekdaysMin(),
      monthNames: moment.monthsShort(),
      firstDay: moment.localeData().firstDayOfWeek()
    };

    let start = startDate.format('YYYY-MM-DD HH:mm:ss');
    let end = endDate.format('YYYY-MM-DD HH:mm:ss');
    let label = start + ' - ' + end;
    if (start === end) {
      label = start;
    }
    return(
      <div className="pull-right">
        {
          viewMode === "metrics" && ambariUrlCallback
          ? <button className="btn btn-default m-r-sm" title="Ambari" onClick={ambariUrlCallback}><img className="icon-image" width="18" height="18" src="styles/img/ambari-logo.png"/></button>
          : null
        }
        {
          viewMode === "metrics" && grafanaUrlCallback
          ? <button className="btn btn-default m-r-sm"  title="Grafana" onClick={grafanaUrlCallback}><img className="icon-image" width="18" height="18" src="styles/img/grafana-logo.png"/></button>
          : null
        }
        {
          viewMode === "metrics" && atlasUrlCallback
          ? <button className="btn btn-default m-r-sm"  onClick={atlasUrlCallback}><i className="fa fa-globe fa-lg"></i></button>
          : null
        }
        {
          viewMode === "explorer" || viewMode === "metrics" || viewMode === 'topics' || viewMode === 'brokers'
          ? <DateTimePickerDropdown
              pullRight={true}
              dropdownId="data-explorer-datepicker-dropdown"
              startDate={startDate}
              endDate={endDate}
              locale={locale}
              isDisabled={false}
              datePickerCallback={this.datePickerCallback}/>
          : null
        }
        {
          viewMode === "explorer"
          ? <div style={{marginLeft : 10,display : "inline-block"}}>
              <DropdownButton
                bsStyle="success"
                title="ACTIONS"
                key={1}
                id={`dropdown-basic`}
                onSelect={this.onDropdownSelect}
              >
                <MenuItem eventKey="1">Action</MenuItem>
                <MenuItem eventKey="2">Another action</MenuItem>
                <MenuItem eventKey="3" active>
                  Active Item
                </MenuItem>
                <MenuItem divider />
                <MenuItem eventKey="4">Separated link</MenuItem>
              </DropdownButton>
            </div>
          : null
        }
      </div>
    );
  }
}
