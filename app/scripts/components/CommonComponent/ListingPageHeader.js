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
import {Dropdown, MenuItem} from 'react-bootstrap';
import DateTimePicker from './DateTimePickerDropdown';
import moment from 'moment';

class ListingPageHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      sort: ''
    };
  }
  onSearchChange = (e) => {
    this.props.onFilter(e.target.value);
    this.setState({searchText: e.target.value});
  }
  onSearchKeyUp = (e) => {
    if(e.key == 'Enter'){
    }
  }
  onSort = (eventKey) => {
    this.setState({sort: eventKey},()=>{
      this.props.onSort(eventKey);
    });
  }

  render() {
    const {title, onSearch, onDateChange,startDate,endDate} = this.props;
    const {searchText,sort} = this.state;
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
    return (
      <div className="row m-b-sm">
        <div className="col-md-3">
          <h4 className="m-l-sm weight-400">{title}</h4>
        </div>
        <div className="col-md-9 text-right">
          <div className="search-box m-r-xs">
            <i className="fa fa-search search-icon" />
            <input
              value={searchText}
              placeholder="Search"
              className={`form-control search-input display-inline active`}
              onChange={this.onSearchChange}
              //onKeyUp={this.onSearchKeyUp}
            />
          </div>
          {/*<Dropdown
            id="header-dropdown-sort"
            onSelect={this.onSort}
          >
            <Dropdown.Toggle>
              <i className="fa fa-sort m-r-xs" />
              Name
            </Dropdown.Toggle>
            <Dropdown.Menu >
              <MenuItem eventKey="Asc" className={sort === "Asc" ? "active" : ""} > Ascending</MenuItem>
              <MenuItem eventKey="Dsc" className={sort === "Dsc" ? "active" : ""}> Descending</MenuItem>
            </Dropdown.Menu>
          </Dropdown>*/}
          <DateTimePicker
            dropdownId="data-explorer-datepicker-dropdown"
            startDate={startDate}
            locale={locale}
            endDate={endDate}
            datePickerCallback={onDateChange}
          />
        </div>
      </div>
    );
  }
}
export default ListingPageHeader;
