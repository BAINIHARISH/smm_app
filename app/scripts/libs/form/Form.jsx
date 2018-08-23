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
import {
  Button,
  Form,
  FormGroup,
  Col,
  FormControl,
  Checkbox,
  Radio,
  ControlLabel
} from 'react-bootstrap';

export default class FSForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      FormData: props.FormData,
      Errors: props.Errors
    };
  }
  componentDidMount = () => {}
  componentWillReceiveProps = (nextProps) => {
    if (this.props.FormData != nextProps.FormData) {
      this.updateFormData(nextProps.FormData);
    }
  }

  updateFormData(newFormData) {
    this.setState({
      FormData: _.assignInWith(this.state.FormData, _.cloneDeep(newFormData)),
      Errors: this.state.Errors
    });
  }

  clearErrors(){
    for (let key in this.state.Errors) {
      delete this.state.Errors[key];
    }
    this.forceUpdate();
  }

  getChildContext() {
    return {Form: this};
  }
  render() {
    return (
      <Form className={this.props.className} style={this.props.style}>
        {this.props.children.map((child, i) => {
          let className = this.props.showRequired == null ? '' :
            (this.props.showRequired ?
              (!child.props.fieldJson.isOptional ? '' : 'hidden') :
                (child.props.fieldJson.isOptional ? '' : 'hidden')
            );
          if(this.props.showRequired === false){
            if(this.props.showSecurity) {
              className = child.props.fieldJson.hint && child.props.fieldJson.hint.indexOf('security_') > -1 ? '' :'hidden';
            } else {
              className = child.props.fieldJson.isOptional ? '' :'hidden';
              if(child.props.fieldJson.hint && child.props.fieldJson.hint.indexOf('security_') > -1) {
                className = 'hidden';
              }
            }
          }
          if(this.props.showRequired == null){
            if(this.props.showSecurity == true) {
              className = child.props.fieldJson.hint && child.props.fieldJson.hint.indexOf('security_') > -1 ? '' :'hidden';
            } else {
              className = child.props.fieldJson.hint && child.props.fieldJson.hint.indexOf('security_') > -1 ? 'hidden' :'';
            }
          }
          if(this.props.showRequired === true && child.props.fieldJson.isOptional === false ){
            className = child.props.fieldJson.hint && child.props.fieldJson.hint.indexOf('security_ssl_required') !== -1
                        ? 'hidden'
                        : child.props.fieldJson.hint && child.props.fieldJson.hint.indexOf('security_kerberos_required') !== -1
                          ? 'hidden'
                          : '';
          }
          return React.cloneElement(child, {
            ref: child.props
              ? (child.props._ref || i)
              : i,
            key: i,
            data: this.state.FormData,
            className: className
          });
        })}
      </Form>
    );
  }
  validate() {
    let isFormValid = true;
    const invalidFields = [];
    for (let key in this.refs) {
      let component = this.refs[key];
      if (component.type == "FormField") {
        let isFieldValid = false;
        if (component.props.fieldJson.type === "number") {
          const val = component.props.data[key];
          if ((_.isNaN(val) || _.isUndefined(val)) && component.props.fieldJson.isOptional) {
            isFieldValid = true;
          } else {
            const min = component.props.fieldJson.min === undefined
              ? 0
              : component.props.fieldJson.min;
            const max = component.props.fieldJson.max === undefined
              ? Number.MAX_SAFE_INTEGER
              : component.props.fieldJson.max;
            isFieldValid = (val >= min && val <= max)
              ? true
              : false;
          }
        } else if(component.props.fieldJson.type === "file"){
          isFieldValid = component.props.fieldJson.hint.indexOf(component.props.value.split('.')[component.props.value.split('.').length - 1]) !== -1 ? true : false;
        } else {
          isFieldValid = component.validate();
          if(_.isObject(isFieldValid)){
            isFieldValid = isFieldValid.isFormValid;
          }
        }
        if (isFormValid) {
          isFormValid = isFieldValid;
        }
        if(!isFieldValid){
          invalidFields.push(component);
        }
      }
    }

    return {isFormValid, invalidFields};
  }
}

FSForm.defaultProps = {
  showRequired: true,
  readOnly: false,
  Errors: {},
  FormData: {}
};

FSForm.childContextTypes = {
  Form: PropTypes.object
};
