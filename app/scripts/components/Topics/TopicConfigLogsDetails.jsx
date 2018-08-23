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
import TopicREST from '../../rest/TopicREST';
import CommonTable from '../CommonComponent/CommonTable';
import Utils from '../../utils/Utils';
import TablePagination from '../CommonComponent/TablePagination';


export default class TopicConfigLogsDetails extends Component{
  constructor(props){
    super(props);
    this.state = {
      tableRowData:[],
      loading : false,
      activePage: 1,
      pageSize: 10,
      noOfResults: 0
    };
  }

  componentDidMount(){
    this.fetchData();
  }

  fetchData() {
    const stateObj = this.state;
    this.setState({loading : true}, () => {
      const {selectedTopic} = this.props;
      TopicREST.getTopicConfig(selectedTopic.name).then((config) => {
        stateObj.loading = false;
        if(config && config.resourceConfigs) {
          stateObj.tableRowData= config.resourceConfigs;
          stateObj.noOfResults = stateObj.tableRowData.length;
        }
        this.setState(stateObj);
      },(err) => {
        stateObj.loading = false;
        this.setState(stateObj);
        Utils.showResponseError(err);
      });
    });
  }

  generateColumnsName = () => {
    const list = ["name","value","isDefault","isSensitive","isReadOnly"];
    let columns=[];
    _.map(list, (l) => {
      columns.push({
        key : l,
        displayName : Utils.capitaliseFirstLetter(l),
        renderHeader : () => {return <div style={{display : "inline-block"}}>{Utils.capitaliseFirstLetter(l)}</div>;},
        renderRow : (item) => {
          let str = item[l];
          if(_.isBoolean(str)){
            str = str === true ? 'true' : 'false';
          }
          return <div style={{display : "inline-block"}}>{str}</div>;
        }
      });
    });
    return columns;
  }

  paginationCallback = (eventKey) => {
    this.setState({
      activePage: eventKey
    });
  }

  render(){
    const {tableRowData,loading,activePage,noOfResults,pageSize} = this.state;
    const noData = !loading ? <div style={{textAlign: 'center'}}>No Data Found</div> : '';
    //
    // const beginList = ((activePage - 1) * pageSize);
    // const endList = beginList + pageSize;
    // const pageList = tableRowData.slice(beginList, endList);
    const pageList = tableRowData;
    return( <div style={{background: 'white', padding: '20px'}}>
              <div className="row">
                <div className="col-sm-12">
                  {
                    tableRowData.length
                    ? <CommonTable columns={this.generateColumnsName()} data={pageList} sortable={["name"]}/>
                    : noData
                  }
                  {/*
                    noOfResults > pageSize
                    ? <TablePagination
                        activePage={activePage}
                        pageSize={pageSize}
                        noOfResults={noOfResults}
                        paginationCallback={this.paginationCallback} />
                    : null
                  */}
                </div>
              </div>
              {loading ? <div className="loading"></div> : null}
            </div>
    );
  }
}
