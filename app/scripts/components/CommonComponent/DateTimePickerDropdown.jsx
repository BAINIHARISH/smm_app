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
import ReactDOM from 'react-dom';
import _ from 'lodash';
import {Link} from 'react-router';
import moment from 'moment';
import DatetimeRangePicker from 'react-bootstrap-datetimerangepicker';
import {DropdownButton, InputGroup, Button, ButtonGroup, ToggleButtonGroup,
  ToggleButton} from 'react-bootstrap';
import  Utils from '../../utils/Utils';

class DateTimePickerDropdown extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showDateRangeSection: false,
      startDate: props.startDate,
      endDate: props.endDate,
      activeDate : 'Last 30 Minutes',
      ranges: {
        'Last 30 Minutes': "LAST_THIRTY_MINUTES",
        'Last 1 Hour': "LAST_ONE_HOUR",
        'Last 6 Hours': "LAST_SIX_HOURS",
        'Last 24 Hours': "LAST_ONE_DAY",
        'Last 2 days': "LAST_TWO_DAYS",
        'Last 1 Week': "LAST_ONE_WEEK",
        'Last 30 Days': "LAST_THIRTY_DAYS"
      }
    };
  }
  componentDidMount = () => {
    let params = Utils.getItemFromLocalStorage("dateRange");
    if(params.duration){
      const obj = _.invert(this.state.ranges);
      const date = this.setDateFromContent(obj[params.duration]);
      this.setState({
        startDate: date.startDate,
        endDate: date.endDate,
        activeDate: obj[params.duration]
      });
    } else {
      this.setState({
        startDate: moment(params.from),
        endDate: moment(params.to),
        activeDate: ''
      });
    }
  }
  showHideDateRangePicker = (isOpen, e, source) => {
    this.setState({showDateRangeSection: !this.state.showDateRangeSection});
  }
  handleEvent(dateLabel, e, datePicker) {
    let obj = {};
    obj[dateLabel] = datePicker.startDate;
    this.setState(obj);
  }
  handleApplyBtnClick = () => {
    const str =  {from: this.state.startDate, to: this.state.endDate};
    this.props.datePickerCallback(JSON.stringify(str));
    this.setState({showDateRangeSection: !this.state.showDateRangeSection, activeDate: ''});
  }
  handleSelectQuickRange (rangesObj, e) {
    if(e.target.nodeName == 'A' || e.target.nodeName == 'LI') {
      let duration = rangesObj[e.target.textContent];
      this.props.datePickerCallback(duration);
      const date = this.setDateFromContent(e.target.textContent);
      this.setState({
        showDateRangeSection: !this.state.showDateRangeSection,
        activeDate: e.target.textContent,
        startDate: date.startDate,
        endDate: date.endDate
      });
    }
  }
  setDateFromContent = (str) => {
    const d = str.split(' ');
    return {
      startDate : moment().subtract(parseInt(d[1]), d[2].toLowerCase()),
      endDate : moment()
    };
  }

  render() {
    let {startDate, endDate, ranges,activeDate} = this.state;
    let labelStart = this.state.startDate.format('YYYY-MM-DD HH:mm:ss');
    let labelEnd = this.state.endDate.format('YYYY-MM-DD HH:mm:ss');
    const datePickerTitleContent = (
      <span><i className="fa fa-undo"></i> {moment.duration(startDate.diff(endDate)).humanize()}</span>
    );
    return (
      <DropdownButton
        title={datePickerTitleContent}
        id={this.props.dropdownId}
        rootCloseEvent={null}
        pullRight
        open={this.state.showDateRangeSection}
        onToggle={this.showHideDateRangePicker}
        disabled={this.props.isDisabled}
      >
        <div className="row">
          {/*<div className="col-sm-7">
            <div className="sub-heading">Time Range</div>
            <label>FROM</label>
            <DatetimeRangePicker
              singleDatePicker
              timePicker timePicker24Hour timePickerSeconds autoUpdateInput={true}
              showDropdowns
              locale={this.props.locale}
              startDate={this.state.startDate}
              onApply={this.handleEvent.bind(this, 'startDate')}
            >
              <InputGroup className="selected-date-range-btn">
                <Button>
                  <div className="pull-right">
                    <i className="fa fa-calendar"/>
                  </div>
                  <span className="pull-left">{labelStart}</span>&nbsp;
                </Button>
              </InputGroup>
            </DatetimeRangePicker>
            <label>TO</label>
            <DatetimeRangePicker
              singleDatePicker
              timePicker timePicker24Hour timePickerSeconds
              showDropdowns
              locale={this.props.locale}
              startDate={this.state.endDate}
              autoUpdateInput={true}
              onApply={this.handleEvent.bind(this, 'endDate')}
            >
              <InputGroup className="selected-date-range-btn">
                <Button>
                  <div className="pull-right">
                    <i className="fa fa-calendar"/>
                  </div>
                  <span className="pull-left">{labelEnd}</span>&nbsp;
                </Button>
              </InputGroup>
            </DatetimeRangePicker>
            <Button type="button" disabled className="btn-success pull-right row-margin-top" onClick={this.handleApplyBtnClick}>APPLY</Button>
          </div>*/}
          <div className="quick-ranges col-sm-12">
            <div className="sub-heading">Quick Ranges</div>
            <div className="row">
              <div>
                <ul onClick={this.handleSelectQuickRange.bind(this, ranges)}>
                  {
                    _.keys(ranges).map((r, i)=>{
                      return <li key={i} className={activeDate === r ? 'active' : ''}><a>{r}</a></li>;
                    })
                  }
                </ul>
              </div>
            </div>
          </div>
          </div>
      </DropdownButton>
    );
  }
}

export default DateTimePickerDropdown;
