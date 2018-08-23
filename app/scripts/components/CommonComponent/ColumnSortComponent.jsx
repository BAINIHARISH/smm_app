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


export default class ColumnSortComponent extends Component{
  constructor(props){
    super(props);
  }

  handleSorting = (e) => {
    const {sortHandler} = this.props;
    e.stopPropagation();
    const dataset = e.target.dataset;
    sortHandler(dataset);
  }

  render(){
    const {fieldName,name,sortedAttr={},className,label} = this.props;
    return(
      <div data-fieldName={fieldName} data-name={name} className={`panel-sort ${className || ''}`} style={{display: 'inline-block'}} onClick={this.handleSorting}>
        {label.toUpperCase()}
        {
          sortedAttr.attr === name && sortedAttr.type !== ''
          ? sortedAttr.type === 'asc'
            ? <i className="sort-arrow fa fa-caret-down"></i>
            : <i className="sort-arrow fa fa-caret-up"></i>
          : <i className="sort-arrow fa fa-sort" style={{color: 'rgba(145, 145, 145, 0.64)'}}></i>
        }
      </div>
    );
  }
}

export class TopicSortComponent extends Component{
  constructor(props){
    super(props);
  }

  render(){
    const {topicSort, sortTopicByAttr} = this.props;
    return(
      <div className="alt-panel-cust">
        <div className="panel panel-default">
          <div className="alt-panel-heading">
            <div className="alt-panel-title">
                <div className="alt-panel-table">
                  <div className="alt-panel-sections first">
                    <h6 className="schema-th">
                      <ColumnSortComponent sortedAttr={topicSort} fieldName="topicSort" label="NAME" name="name" sortHandler={sortTopicByAttr}/>
                    </h6>
                  </div>
                  <div className="alt-panel-sections">
                    <h6 className="schema-th">
                      <ColumnSortComponent sortedAttr={topicSort} fieldName="topicSort" label="DATA IN" name="bytesInCount" sortHandler={sortTopicByAttr}/>
                    </h6>
                  </div>
                  <div className="alt-panel-sections">
                    <h6 className="schema-th">
                      <ColumnSortComponent sortedAttr={topicSort} fieldName="topicSort" label="DATA OUT" name="bytesOutCount" sortHandler={sortTopicByAttr}/>
                    </h6>
                  </div>
                  <div className="alt-panel-sections">
                    <h6 className="schema-th">
                      <ColumnSortComponent sortedAttr={topicSort} fieldName="topicSort" label="MESSAGES IN" name="messagesInCount" sortHandler={sortTopicByAttr}/>
                    </h6>
                  </div>
                  {/*<div className="alt-panel-sections">
                    <h6 className="schema-th">
                      <ColumnSortComponent sortedAttr={topicSort} fieldName="topicSort" label="PARTITIONS" name="partitions" sortHandler={sortTopicByAttr}/>
                    </h6>
                  </div>*/}
                  <div className="alt-panel-sections column-18">
                    <h6 className="schema-th">
                      <ColumnSortComponent sortedAttr={topicSort} fieldName="topicSort" label="CONSUMER GROUPS" name="consumerGroupsCount" sortHandler={sortTopicByAttr}/>
                    </h6>
                  </div>
                  <div className="alt-panel-sections">
                    <h6 className="schema-th">
                    </h6>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export class BrokerSortComponent extends Component{
  constructor(props){
    super(props);
  }

  render(){
    const {brokerSort, sortByAttr} = this.props;
    return(
      <div className="alt-panel-cust">
        <div className="panel panel-default">
          <div className="alt-panel-heading">
            <div className="alt-panel-title">
                <div className="alt-panel-table">
                  <div className="alt-panel-sections first">
                    <h6 className="schema-th">
                      <ColumnSortComponent sortedAttr={brokerSort} fieldName="brokerSort" label="NAME" name="node.id" sortHandler={sortByAttr}/>
                    </h6>
                  </div>
                  <div className="alt-panel-sections">
                    <h6 className="schema-th">
                      <ColumnSortComponent sortedAttr={brokerSort} fieldName="brokerSort" label="THROUGHPUT" name="throughput" sortHandler={sortByAttr}/>
                    </h6>
                  </div>
                  <div className="alt-panel-sections">
                    <h6 className="schema-th">
                      <ColumnSortComponent sortedAttr={brokerSort} fieldName="brokerSort" label="MESSAGES IN" name="messageIn" sortHandler={sortByAttr}/>
                    </h6>
                  </div>
                  <div className="alt-panel-sections">
                    <h6 className="schema-th">
                      <ColumnSortComponent sortedAttr={brokerSort} fieldName="brokerSort" label="PARTITIONS" name="partitions" sortHandler={sortByAttr}/>
                    </h6>
                  </div>
                  <div className="alt-panel-sections">
                    <h6 className="schema-th">
                      <ColumnSortComponent sortedAttr={brokerSort} fieldName="brokerSort" label="REPLICAS" name="replicas" sortHandler={sortByAttr}/>
                    </h6>
                  </div>
                  <div className="alt-panel-sections">
                    <h6 className="schema-th">
                    </h6>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export class ProducerSortComponent extends Component{
  constructor(props){
    super(props);
  }

  render(){
    const {producerSort, sortByAttr} = this.props;
    return(
      <div className="alt-panel-cust">
        <div className="panel panel-default">
          <div className="alt-panel-heading">
            <div className="alt-panel-title">
                <div className="alt-panel-table producer-alt">
                  <div className="alt-panel-sections first">
                    <h6 className="schema-th">
                      <ColumnSortComponent sortedAttr={producerSort} fieldName="producerSort" label="NAME" name="clientId" sortHandler={sortByAttr}/>
                    </h6>
                  </div>
                  <div className="alt-panel-sections">
                    <h6 className="schema-th">
                      <ColumnSortComponent sortedAttr={producerSort} fieldName="producerSort" label="MESSAGES" name="latestOutMessagesCount" sortHandler={sortByAttr}/>
                    </h6>
                  </div>
                  <div className="alt-panel-sections">
                    <h6 className="schema-th">
                    </h6>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export class ConsumerSortComponent extends Component{
  constructor(props){
    super(props);
  }

  render(){
    const {consumerSort, sortByAttr} = this.props;
    return(
      <div className="alt-panel-cust">
        <div className="panel panel-default">
          <div className="alt-panel-heading">
            <div className="alt-panel-title">
                <div className="alt-panel-table consumer-alt">
                  <div className="alt-panel-sections first">
                    <h6 className="schema-th">
                      <ColumnSortComponent sortedAttr={consumerSort} fieldName="consumerSort" label="NAME" name="consumerGroupInfo.id" sortHandler={sortByAttr}/>
                    </h6>
                  </div>
                  <div className="alt-panel-sections">
                    <h6 className="schema-th">
                      <ColumnSortComponent sortedAttr={consumerSort} fieldName="consumerSort" label="LAG" name="lagCount" sortHandler={sortByAttr}/>
                    </h6>
                  </div>
                  <div className="alt-panel-sections">
                    <h6 className="schema-th">
                    </h6>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
