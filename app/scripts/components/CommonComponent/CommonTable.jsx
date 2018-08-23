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
import _ from 'lodash';

export default class CommonTable extends Component {
  constructor(props){
    super(props);
    this.state = {
      sortArr : this.populateSortArr(props.sortable),
      data : props.data
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.data !== this.props.data) {
      this.setState({data : newProps.data});
    }
  }

  populateSortArr = (array) => {
    let arr=[];
    _.map(array, (a) => {
      arr.push({
        keyName : a,
        ascending : false
      });
    });
    return arr;
  }


  sortingFunction = (key, order) => {
    return function(a, b) {
      if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        return 0;
      }

      const varA = (typeof a[key] === 'string') ?
        a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string') ?
        b[key].toUpperCase() : b[key];

      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return (
        !order ? (comparison * -1) : comparison
      );
    };
  }

  handleSorting = (key) => {
    const {data,sortArr} = this.state;
    let tempData = _.cloneDeep(data);
    let tempSort =  _.cloneDeep(sortArr);
    let index = _.findIndex(tempSort, (s) => s.keyName === key);
    if(index !== -1){
      tempSort = _.map(tempSort, (t, i) => {
        t.sortingIcon = index === i ? true : false;
        t.ascending = index === i ? !t.ascending : false;
        return t;
      });
      tempData.sort(this.sortingFunction(key,tempSort[index].ascending));
      this.setState({data : tempData, sortArr : tempSort});
    }
  }

  getHeader = (hearders,keys) => {
    const style = {
      color : "#55abf5",
      marginLeft : "5px",
      display : "inline-block"
    };
    const {sortArr, data} = this.state;
    return(
      <tr>
        { hearders.map((head, n) => {
          const sortFlag = this.props.sortable.indexOf(keys[n]) !== -1 ? true : false;
          const index = sortFlag ? _.findIndex(sortArr,(s) => s.keyName === keys[n] && s.sortingIcon) : -1;
          return <th key={n} onClick={this.handleSorting.bind(this,keys[n])} style={{cursor: `${sortFlag ? 'pointer' : ''}`}} >
            {
              head.renderHeader
              ? head.renderHeader(head)
              : head.displayName
            }
            {
              sortFlag && data.length > 0
              ? index !== -1
                ? sortArr[index].ascending
                  ? <i className="fa fa-caret-up" style={style} aria-hidden="true"></i>
                  : <i className="fa fa-caret-down" style={style} aria-hidden="true"></i>
                : <i className="fa fa-sort" style={{marginLeft: '5px', display:'inline-block'}}></i>
              : null
            }
          </th>;
        })
        }
      </tr>
    );
  }

  getContent = (data,columns) => {
    if(data.length < 1){
      return "No records";
    }
    return(
      _.map(data, (item,i) => {
        return <tr key={i}>
          {
            _.map(columns, (column,k) => {
              return <td key={k}>
                {
                  column.renderRow
                  ? column.renderRow(item)
                  :item[key]
                }
              </td>;
            })
          }
        </tr>;
      })
    );
  }

  render() {
    const {data} = this.state;
    const { columns, sortable} = this.props;
    const colkeys = _.map(columns,'key');
    return (
      <div className="table-responsive">
      <table className="common-table table">
        <thead>{this.getHeader(columns,colkeys)}</thead>
        <tbody>{this.getContent(data,columns)}</tbody>
      </table>
      </div>
    );
  }
};

CommonTable.propTypes = {
  columns : PropTypes.array.isRequired,
  data : PropTypes.array.isRequired,
  sortable : PropTypes.array,
  className : PropTypes.string
};
