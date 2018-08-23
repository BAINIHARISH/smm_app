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
import CommonTable from './CommonTable';
import TablePagination  from './TablePagination';

export default class CommonSummaryAndTable extends Component{
  constructor(props){
    super(props);
  }

  render(){
    const {summaryList,columnSort,columns,tableData,activePage,pageSize,noOfResults,paginationCallback} = this.props;
    const beginList = ((activePage - 1) * pageSize);
    const endList = beginList + pageSize;
    const pageList = tableData.slice(beginList, endList);
    return(<div className="summary-panels row-eq-height">
      <div className="col-sm-3">
        <div className="summary-info">
        {
          summaryList.length
          ? [
            <h4 key={1}>Summary</h4>,
            <ul key={2} className="summary-list">
              {
                _.map(summaryList, (list, i) => {
                  return <li key={i}>{list.name}<span>{list.value}</span></li>;
                })
              }
            </ul>
          ]
          : null
        }
        </div>
      </div>
      <div className="col-sm-9">
        <div className="summary-table">
          <CommonTable  columns={columns} data={pageList} sortable={columnSort} />
            {
              noOfResults > pageSize
              ? <div className="row">
                  <div className="col-sm-12">
                    <TablePagination
                      activePage={activePage}
                      pageSize={pageSize}
                      noOfResults={noOfResults}
                      paginationCallback={paginationCallback} />
                  </div>
                </div>
              : null
            }
        </div>
      </div>
    </div>
    );
  }
}
