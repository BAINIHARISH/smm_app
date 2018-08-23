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
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import {Scrollbars} from 'react-custom-scrollbars';

export default class CommonDetailPopUp extends Component{
  constructor(props){
    super(props);
    this.viewType = '';
    this.dPosition = {
      fromTop : 30,
      fromLeft : 500,
      pos3 : 0,
      pos4:0
    };
    this.fromTop = 50;
    this.fromLeft = 500;
    this.internalFlags = false;
  }

  componentDidMount(){
    this.popUpDiv = document.getElementsByClassName('kafka-graph-overlay-container')[0];
    if(!!this.popUpDiv){
      this.forceUpdate();
    }
  }

  componentWillUnmount(){
    const popNode = document.getElementById('popup-children');
    if(!!popNode){
      popNode.remove();
    }
  }

  popUpMouseEnter = () => {
    window.addEventListener('mousemove', this.dynamicPositionPopUp, false);
  }

  popUpMouseLeave= () => {
    window.removeEventListener('mousemove', this.dynamicPositionPopUp, false);
  }

  dynamicPositionPopUp = (e) => {
    if(this.internalFlags){
      let pos1 = 0, pos2 = 0;
      pos1 = this.dPosition.pos3 - e.clientX;
      pos2 = this.dPosition.pos4 - e.clientY;
      this.dPosition.pos3 = e.clientX;
      this.dPosition.pos4 = e.clientY;
       // set the element's new position:
      this.dPosition.fromTop = (this.popupRef.offsetTop - pos2) + "px";
      this.dPosition.fromLeft = (this.popupRef.offsetLeft - pos1) + "px";
      this.forceUpdate();
    }
  }

  popUpMouseDown = (e) => {
    const evt = e || window.event;
    this.dPosition.pos3 = evt.clientX;
    this.dPosition.pos4 = evt.clientY;
    this.internalFlags = true;
  }

  popUpMouseUp = (e) => {
    const evt = e || window.event;
    this.internalFlags = false;
  }

  renderCommonPopUp = () => {
    const popUpContant = <div className="common-detail-popup" style={{top : this.dPosition.fromTop, left : this.dPosition.fromLeft}} ref={(ref) => this.popupRef = ref}  onMouseUp={this.popUpMouseUp.bind(this)} onMouseDown={this.popUpMouseDown.bind(this)} onMouseEnter={this.popUpMouseEnter.bind(this)} onMouseLeave={this.popUpMouseLeave.bind(this)}>
                            <div className="common-popup-container">
                              {this.getHeader()}
                              <Scrollbars autoHide style={{height: 235 , width : 210}} renderThumbHorizontal={props => <div {...props} style={{
                                display: "none"
                              }}/>}>
                                {this.getGraphContent()}
                                {this.getFooterContent()}
                              </Scrollbars>
                            </div>
                            <div className="common-popup-icon">
                              <span className={`hb success status-icon`} title={`View ${this.viewType} profile`} onClick={this.navigateToDetailPage}><i className={'fa fa-list-alt'}></i></span>
                            </div>
                          </div>;
    if(!!this.popUpDiv){
      this.node = document.createElement('div');
      this.node.setAttribute('id', 'popup-children');
      this.node.setAttribute('z-index',1300);
      const childNode = document.getElementById('popup-children');
      if(childNode === null){
        this.popUpDiv.parentNode.appendChild(this.node);
      }
      ReactDom.render(popUpContant,document.getElementById('popup-children'));
    }
    return  <div></div>;
  }

  render(){
    return(this.renderCommonPopUp());
  }
}

CommonDetailPopUp.contextTypes = {
  router: PropTypes.object.isRequired
};
