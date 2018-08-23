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
import CommonTable from '../CommonComponent/CommonTable';
import TablePagination from '../CommonComponent/TablePagination';
import Utils from '../../utils/Utils';
import {Select2 as Select} from '../../utils/SelectUtils';
import moment from 'moment';
import {
  FormGroup,
  InputGroup,
  FormControl,
  Button,
  DropdownButton,
  MenuItem
} from 'react-bootstrap';
import DateTimePickerDropdown from '../CommonComponent/DateTimePickerDropdown';
import {toastOpt} from '../../utils/Constants';
import TopicREST from '../../rest/TopicREST';
import FSReactToastr from '../CommonComponent/FSReactToastr' ;
import CommonNotification from '../../utils/CommonNotification';
import Modal from '../CommonComponent/FSModal';
import Tooltip from 'rc-tooltip';
import Slider from 'rc-slider';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Handle = Slider.Handle;

const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
};

export default class DataExplorer extends Component{
  constructor(props){
    super(props);
    this.state = {
      searchDropdownVal : props.activePatition ? props.activePatition : 0,
      searchString : '',
      activePage: 1,
      pageSize: 10,
      noOfResults: 0,
      formatView : "Table",
      dataExp : {},
      keyDeserial : null,
      valueDeserial : null,
      fromOffset : '',
      toOffset : '',
      loading : false,
      tableRowData :[],
      showMoreModelText :'',
      topicName:'',
      payloadData:{},
      offsetMaxLimit:0,
      offsetsInfo:[]
    };
    this.filterList = [];
  }

  componentDidMount(){
    this.fetchData();
  }

  populateFilterList = (entity) => {
    const obj={};
    _.map(entity.partitionMetrics, (p, key) => {
      obj[`${key}`] = key;
    });
    return obj;
  }

  fetchData = () => {
    const {selectedTopic} = this.props;
    const stateObj= this.state;
    const {fromOffset,toOffset,keyDeserial,valueDeserial,searchDropdownVal} = stateObj;
    let name=  this.props.location && this.props.location.state? this.props.location.state.topicName : (selectedTopic.name || this.props.routeParams.id);
    this.setState({loading:true}, () => {
      let PromiseArr = [TopicREST.getTopicOffset(name)];
      PromiseArr.push(TopicREST.getSerDes().then((res) => {
        const serDesRes = res.deserializerInfos;
        stateObj.keyDeserial = serDesRes[0];
        stateObj.valueDeserial = serDesRes[0];
        stateObj.serDes = serDesRes;
        return res;
      }));
      Promise.all(PromiseArr).then((results) => {
        _.map(results, (result) => {
          if(result.responseMessage !== undefined){
            FSReactToastr.error(
              <CommonNotification flag="error" content={result.responseMessage}/>, '', toastOpt);
          }
        });
        stateObj.loading = false;
        stateObj.offsetsInfo = results[0].partitionOffsetInfos;
        stateObj.topicName = name;
        stateObj.fromOffset = this.getOffset(stateObj.offsetsInfo,searchDropdownVal,'startOffset');
        stateObj.toOffset =  this.getOffset(stateObj.offsetsInfo,searchDropdownVal,'endOffset');
        if(stateObj.toOffset >= 100000) {
          if(stateObj.toOffset - stateObj.pageSize >= 0) {
            stateObj.fromOffset = stateObj.toOffset - stateObj.pageSize;
          }
        }
        if(stateObj.toOffset > 15){
          stateObj.fromOffset = (stateObj.toOffset-15);
        }
        stateObj.searchDropdownVal = searchDropdownVal;
        stateObj.offsetMaxLimit = parseInt(stateObj.toOffset);
        const topicObj = selectedTopic;
        this.filterList = this.populateFilterList(topicObj);
        this.setState(stateObj, () => {
          this.getTopicTableData();
        });
      },(err) => {
        stateObj.loading = false;
        this.setState(stateObj);
        Utils.showResponseError(err);
      });
    });
  }

  getOffset = (arr,id,type) => {
    const obj = _.filter(arr,(a) => a.partitionId === id)[0];
    return obj[type];
  }

  getTopicTableData = () => {
    const {selectedTopic} = this.props;
    const {searchDropdownVal,fromOffset,toOffset,keyDeserial,valueDeserial,topicName} = this.state;
    const obj={};
    obj['startOffset'] = fromOffset;
    obj['endOffset'] = toOffset;
    obj['keyDeserializer'] = keyDeserial.className;
    obj['valueDeserializer'] = valueDeserial.className;

    this.setState({loading: true}, () => {
      TopicREST.getTopicPartionsPayload(topicName,searchDropdownVal,obj).then((payloads) => {
        if(payloads.responseMessage !== undefined){
          FSReactToastr.error(
            <CommonNotification flag="error" content={payloads.responseMessage}/>, '', toastOpt);
        } else {
          const stateObj={};
          stateObj.loading = false;
          stateObj.payloadData = payloads;
          stateObj.tableRowData =  this.mappedTableData(payloads.offsetToRecordMap);
          stateObj.noOfResults = stateObj.tableRowData.length;
          //stateObj.offsetMaxLimit = this.getMaxOffsetLimit(payloads.offsetToRecordMap);
          stateObj.activePage = 1;
          this.setState(stateObj);
        }
      }).catch((err) => {
        this.setState({loading: false});
        Utils.showResponseError(err);
      });
    });
  }

  getMaxOffsetLimit = (offsetObj) => {
    return _.maxBy(_.map(offsetObj,'offset'))  || 0;
  }

  mappedTableData = (data) => {
    const list = _.map(data,(obj,key) => {
      obj.offset = parseInt(key);
      return obj;
    });
    return list;
  }



  generateColumnsName = () => {
    const list = ["offset","timestamp","value"];
    let columns=[];
    columns.push({
      key : "offset",
      displayName : "Offset",
      renderHeader: () => {return <div style={{display : "inline-block"}}>Offset</div>;},
      renderRow : (item) => {
        let content = item.offset;
        let rowContent = <div style={{display : "inline-block"}}>
          {content}
        </div>;
        return rowContent;
      }
    });
    columns.push({
      key : "timestamp",
      displayName : "Timestamp",
      renderHeader: () => {return <div style={{display : "inline-block"}}>Timestamp</div>;},
      renderRow : (item) => {
        let rowContent = <div style={{display : "inline-block"}}>{
          moment(item.timestamp).format("ddd, MMM DD YYYY, h:mm:ss")}
          </div>;
        return rowContent;
      }
    });
    columns.push({
      key : "value",
      displayName : "Value",
      renderHeader: () => {return <div style={{display : "inline-block"}}>Value</div>;},
      renderRow : (item) => {
        const textLength = 150;
        let content = '';
        const value = item.value;
        if(value){
          if(_.isString(value)){
            content = value;
          }else{
            content = JSON.stringify(value);
          }
        }
        let rowContent = <div style={{display : "inline-block"}}>{
          content.length > textLength ?
          <div>{Utils.ellipses(content,textLength)} <span className="data-explorer-showmore-btn" onClick={this.tableRowShowMore.bind(this,content)}>showmore</span></div>
          : content
          }
          </div>;
        return rowContent;
      }
    });
    return columns;
  }

  paginationCallback = (eventKey) => {
    this.setState({
      activePage: eventKey
    });
  }

  onDropdownSelect = (eventKey)  => {
    const {offsetsInfo,pageSize} = this.state,obj={};
    const val = parseInt(eventKey);
    obj.searchDropdownVal= val;

    let fromOffset = parseInt(this.getOffset(offsetsInfo,val,'endOffset')) - 15;
    fromOffset = fromOffset > 0 ? fromOffset : 0;

    obj.fromOffset = fromOffset;
    obj.toOffset =  parseInt(this.getOffset(offsetsInfo,val,'endOffset'));
    if(obj.toOffset >= 100000) {
      if(obj.toOffset - pageSize >= 0) {
        obj.fromOffset = obj.toOffset - pageSize;
      }
    }
    obj.offsetMaxLimit = obj.toOffset;
    obj.loading = true;
    this.setState(obj, () => this.getTopicTableData());
  }

  datePickerCallback  = (startDate, endDate) => {
    this.setState({
      activePage: 1
    }, () => {
      this.props.datePickerHandler(startDate, endDate);
    });
  }

  handleStringChange = (e) => {
    const name = e.target.dataset.name;
    const val = e.target.value;
    const obj = _.cloneDeep(this.state);
    obj[name] = parseInt(val);
    this.setState(obj);
  }

  handleStringOnBlur = () => {
    this.setState({loading: true}, () => this.getTopicTableData());
  }

  selectChange = (type,obj) => {
    const temp = this.state;
    if(!!obj){
      temp[type] = obj;
      temp.loading = true;
      this.setState(temp, () => this.getTopicTableData());
    }
  }

  tableRowShowMore = (text) => {
    this.setState({showMoreModelText : text},() => {
      this.tableRowValueModal.show();
    });
  }

  sliderChangeHandler = (arr) => {
    this.setState({
      loading : true,
      fromOffset: arr[0],
      toOffset: arr[1]
    }, () => {
      this.getTopicTableData();
    });
  }

  getSliderMarks = (maxOffset) => {
    const steps = maxOffset > 1000 ? 6 : 3;
    let val = maxOffset / steps,mergeValue=0;
    let obj={0 : 0};
    for(let i =0 ; i < (steps - 1); i++){
      mergeValue += Math.floor(val);
      obj[mergeValue] = mergeValue;
    }
    // this is to show the maxOffset
    obj[maxOffset] = maxOffset;
    return obj;
  }

  renderFieldOption(node) {
    return (<div title={node.className}>
      <span>{node.type}</span>
      <span style={{display:'block', color: '#919191', fontSize: '12px'}}>{node.className}</span>
    </div>);
  }

  renderValueComponent(type,node){
    return <div title={node.className}>
      <span>{type}: {node.type}</span>
    </div>;
  }

  handleKeyPress = (event) => {
    if (event.key === "Enter") {
      this.getTopicTableData();
    }
  }

  render(){
    const {activePage,pageSize,noOfResults,tableRowData,searchDropdownVal,searchString,formatView,keyDeserial,valueDeserial,fromOffset,toOffset,loading,showMoreModelText,payloadData,offsetMaxLimit,
      serDes
    } = this.state;
    const {viewMode,startDate,endDate,selectedTopic} = this.props;
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
    const beginList = ((activePage - 1) * pageSize);
    const endList = beginList + pageSize;
    const pageList = tableRowData.slice(beginList, endList);

    const Range = createSliderWithTooltip(Slider.Range);

    const rangeFrom = parseInt(fromOffset) || 0;
    const rangeTo = parseInt(toOffset) || 0;
    const marks = this.getSliderMarks(offsetMaxLimit);

    return(
      <div style={{background: 'white', padding: '20px'}}>
        <div className="row" key={"row-2"}>
          <div className="col-xs-offset-6  col-sm-2 form-group text-right">
            <label style={{lineHeight: '35px'}}>Deserializer:</label>
          </div>
          <div className="col-sm-2 form-group">
            <div>
              <Select className="option-menu-select" value={keyDeserial} options={serDes} onChange={this.selectChange.bind(this,'keyDeserial')} clearable={false} optionRenderer={this.renderFieldOption} valueRenderer={this.renderValueComponent.bind(this,'Keys')}
                labelKey="type"
                valueKey="className"
              />
            </div>
          </div>
          <div className="col-sm-2 form-group">
            <div>
              <Select className="option-menu-select" value={valueDeserial} options={serDes} onChange={this.selectChange.bind(this,'valueDeserial')} clearable={false} optionRenderer={this.renderFieldOption} valueRenderer={this.renderValueComponent.bind(this,'Values')}
                labelKey="type"
                valueKey="className"
              />
            </div>
          </div>
        </div>
        <div className="row" key={"row-14"}>
          <div className="col-sm-2 form-group">
            <label>&nbsp;</label>
            <div className="dataexplorer-form">
              <DropdownButton
               id="topic"
               title={`Partition ${this.filterList[`${searchDropdownVal}`] || ''}`}
               pullRight={true}
               onSelect={this.onDropdownSelect}>
               {
                 _.map(selectedTopic.partitionMetrics, (p,key) => {
                   return <MenuItem  key={key} active={`${searchDropdownVal}` === `${key}` ? true : false}  eventKey={`${key}`}>
                           {key}
                         </MenuItem>;
                 })
               }
             </DropdownButton>
            </div>
          </div>
          <div className="col-sm-1 form-group">
            <label>FROM OFFSET</label>
            <div className="dataexplorer-form">
              <input  type="number"
                min={0}
                max={offsetMaxLimit}
                data-name="fromOffset"
                value={fromOffset}
                onChange={this.handleStringChange}
                onBlur={this.handleStringOnBlur}
                onKeyPress={this.handleKeyPress}
                className={`form-control ${fromOffset > toOffset ? 'invalidInput' : ''}`}/>
            </div>
          </div>
          <div className="col-sm-8 form-group">
            <label>&nbsp;</label>
            <Range min={0}
              disabled={offsetMaxLimit == 0 ? true : false}
              max={offsetMaxLimit}
              marks={marks}
              allowCross={true}
              defaultValue={[rangeFrom, rangeTo]}
              tipFormatter={value => `${value}`} style={{marginTop: '10px'}}
              onAfterChange={this.sliderChangeHandler}/>
          </div>
          <div className="col-sm-1 form-group">
            <label>TO OFFSET</label>
            <div className="dataexplorer-form">
              <input  type="number"
                min={fromOffset}
                max={offsetMaxLimit}
                data-name="toOffset"
                value={toOffset}
                onChange={this.handleStringChange}
                onBlur={this.handleStringOnBlur}
                onKeyPress={this.handleKeyPress}
                className="form-control"/>
            </div>
          </div>
        </div>
        <div className="row m-t-md" key={"row-4"}>
          <div className="col-sm-12">
            <div>
              <CommonTable columns={this.generateColumnsName()} data={pageList} sortable={["offset"]}/>
              {
                noOfResults > pageSize
                ? <div className="row">
                    <div className="col-sm-12">
                      <TablePagination
                        activePage={activePage}
                        pageSize={pageSize}
                        noOfResults={noOfResults}
                        paginationCallback={this.paginationCallback} />
                    </div>
                  </div>
                : null
              }
              </div>
          </div>
        </div>
        <Modal hideCloseBtn={true} dialogClassName="modal-l" ref={(ref) => this.tableRowValueModal = ref} data-title={selectedTopic.name} data-resolve={() => this.tableRowValueModal.hide()} >
          <div style={{padding : "20px", wordBreak: "break-all"}}>{showMoreModelText}</div>
        </Modal>
        {loading ? <div className="loading"></div> : null}
      </div>
    );
  }
}
