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
import moment from 'moment';
import CommonDetailPopUp from './CommonDetailPopUp';
import MetricNotification from '../MetricNotification';
import TimeSeriesChart from '../../Graph/TimeSeriesChart';
import {PercentageBar} from '../Panel';

export default class ConsumerDetailPopup extends CommonDetailPopUp{
  constructor(props){
    super(props);
    this.state = {
      graphHeight: 25,
      loadingRecord: true,
      timeSeriesMetrics : {
        outputRecords : {
          1520509656065 : 12,
          1520509778900 : 25,
          1520509905323 : 58,
          1520509950717 : 7,
          1520510041927 : 100,
          1520836939778 : 115,
          1521027614668 : 20,
          1521027670698 : 100
        },
        inputRecords : {
          1520509656065 : 33,
          1520509778900 : 34,
          1520509905323 : 190,
          1520509950717 : 5,
          1520510041927 : 18,
          1520836939778 : 88,
          1521027614668 : 55,
          1521027670698 : 145
        }
      },
      startDate: moment().subtract(30, 'minutes'),
      endDate: moment()
    };
    this.viewType = 'Consumer';
  }

  getGraph(name, data, interpolation, renderGraph) {
    const self = this;
    const colorRange = name ===  "lagRate" ? ['#f06261', '#a30000'] :  ['#44abc0', '#8b4ea6'];
    return renderGraph ? <TimeSeriesChart color={d3.scale.category20c().range(colorRange)} ref={name} data={data} interpolation={interpolation} height={this.state.graphHeight} setXDomain={function() {
      this.x.domain([self.state.startDate.toDate(), self.state.endDate.toDate()]);
    }} setYDomain={function() {
      const min = d3.min(this.mapedData, (c) => {
        return d3.min(c.values, (v) => {
          return v.value;
        });
      });
      this.y.domain([
        min > 0
          ? 0
          : min,
        d3.max(this.mapedData, (c) => {
          return d3.max(c.values, (v) => {
            return v.value;
          });
        })
      ]);
    }} getXAxis={function(){
      return d3.svg.axis().orient("bottom").tickFormat("");
    }} getYAxis={function() {
      return d3.svg.axis().orient("left").tickFormat("");
    }} drawBrush={function(){
    }} showTooltip={function(d) {
    }} hideTooltip={function() {
    }} /> : null ;
  }

  navigateToDetailPage = () => {
    const {router} = this.context;
    router.push('/consumers/1');
  }

  getHeader () {
    const {closePopup,title} = this.props;
    return <h5>Consumer: T Events <span className="pull-right"><i className="fa fa-times" onClick={closePopup}></i></span></h5>;
  }
  getGraphContent () {
    const {timeSeriesMetrics,loadingRecord} = this.state;
    const lagData = [];
    const offsetRateData = [];
    const lagRateData = [];
    const {
      outputRecords,
      inputRecords
    } = timeSeriesMetrics;

    for(const key in outputRecords) {
      lagData.push({
        date: new Date(parseInt(key)),
        Input: inputRecords[key] || 0
      });
      offsetRateData.push({
        date: new Date(parseInt(key)),
        Output: outputRecords[key] || 0
      });
      lagRateData.push({
        date: new Date(parseInt(key)),
        total: outputRecords[key] || 0
      });
    }

    return <div>
      <MetricNotification title="Recommended Re-Partition" timeVal={2547} status="danger">
        <Link to="/">other events</Link> dolor sit amet, consecteturing detri...
      </MetricNotification>
      <div className="adjust-padding">
        <div className="row">
        <div className="col-md-12">
          <div className="topology-foot-graphs">
            <div className="metric-graph-title">Lag<span className="pull-right">234</span></div>
            <div style={{
              height: '25px',
              textAlign: 'center',
              backgroundColor: '#f2f3f2'
            }}>
              {this.getGraph('lag', lagData, 'bundle',loadingRecord)}
            </div>
          </div>
        </div>
        <div className="col-md-12">
          <div className="topology-foot-graphs">
            <div className="metric-graph-title">Offset Rate<span className="pull-right">43</span></div>
            <div style={{
              height: '25px',
              textAlign: 'center',
              backgroundColor: '#f2f3f2'
            }}>
              {this.getGraph('offset', offsetRateData, 'step-before',loadingRecord)}
            </div>
          </div>
        </div>
        <div className="col-md-12">
          <div className="topology-foot-graphs">
            <div className="metric-graph-title">Lag Rate<span className="pull-right">+73</span></div>
            <div style={{
              height: '25px',
              textAlign: 'center',
              backgroundColor: '#f2f3f2'
            }}>
              {this.getGraph('lagRate', lagRateData, 'step-before',loadingRecord)}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>;
  }
  getFooterContent () {
    const arr=[{name : "1001", percentage : 35,count : "23,531"},{name : "1002",percentage : 75,count : "10912"},{name : "1003",percentage : 88,count : "14,021"}];
    return <div className="adjust-padding">
      {
        _.map(arr, (a,i) => {
          const color = ['red','light-blue','light-blue'];
          return(
            <div className="partition-metrics" key={i}>
              <div className="inline-block broker-percentage pull-left" style={{width: "83%"}}>
                <PercentageBar status={color[i]} currentPercentage={a.percentage} title={`C${i}`}/>
              </div>
              <div className="inline-block pull-right broker-count">
                {a.count}
              </div>
            </div>
          );
        })
      }
    </div>;
  }
}
