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

class TablePagination extends Component {
  constructor(props) {
    super(props);
  }
  prevPage = ()=> {
    let {activePage} = this.props;
    if (activePage > 1) {
      activePage--;
      this.props.paginationCallback(activePage);
    }
  }

  nextPage = ()=> {
    let {activePage} = this.props;
    if (activePage < this.noOfPages()) {
      activePage++;
      this.props.paginationCallback(activePage);
    }
  }

  noOfPages= () => {
    let {noOfResults, pageSize} = this.props;
    return Math.ceil(noOfResults/pageSize);
  }

  render() {
    let {activePage, noOfResults, pageSize} = this.props;
    let fromItem = (activePage - 1) * pageSize;
    let toItem = fromItem + pageSize;
    toItem = toItem > noOfResults ? noOfResults : toItem;
    return (
      <div className="table-pagination-container">
        <div className="pull-right">
          <span className="m-r-sm">{noOfResults > 0 ? fromItem + 1 : 0} - {toItem} of {noOfResults}</span>
          <a onClick={this.prevPage} className={activePage == 1 || noOfResults == 0 ? "disabled" : ""}><span className="prev"><i className="fa fa-chevron-left"></i></span></a>
          <a onClick={this.nextPage} className={activePage == this.noOfPages() || noOfResults == 0 ? "disabled" : ""}><span className="next"><i className="fa fa-chevron-right"></i></span></a>
        </div>
      </div>
    );
  }
}

export default TablePagination;
