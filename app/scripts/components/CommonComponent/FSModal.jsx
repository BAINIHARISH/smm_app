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
import {Modal, Button} from 'react-bootstrap';

const defaultState = {
  show: false,
  title: '',
  btnOkText: '',
  btnCancelText: ''
};

export default class FSModal extends Component {
  state = defaultState;
  show() {
    var state = state || {};
    state.show = true;
    this.setState(state);
  }
  sure() {
    let resolve = this.props["data-resolve"];
    if (resolve) {
      resolve();
    }
  }
  cancel() {
    let reject = this.props["data-reject"];
    if (reject) {
      reject();
    } else {
      this.hide();
    }
  }
  hide() {
    this.setState({show: false});
  }
  header() {
    return (
      <Modal.Header closeButton={!this.props.hideCloseBtn}>
        <Modal.Title>
          {this.props["data-title"]}
        </Modal.Title>
      </Modal.Header>
    );
  }
  body() {
    return (
      <Modal.Body>
        {this.props.children}
      </Modal.Body>
    );
  }
  footer() {
    return (
      <Modal.Footer>
        {
          this.props.hideCloseBtn
          ? null
          : <Button bsStyle='default' onClick={this.cancel.bind(this)} data-stest="cancelbtn">
              {this.state.btnCancelText || 'Cancel'}
            </Button>
        }
        {
          this.props.hideOkBtn
          ? null
          : <Button bsStyle='success' onClick={this.sure.bind(this)}  data-stest="okbtn" disabled={this.props.btnOkDisabled}>
              {this.state.btnOkText || 'Ok'}
            </Button>
        }
      </Modal.Footer>
    );
  }
  render() {
    return (
      <Modal aria-labelledby='contained-modal-title' backdrop="static" keyboard={this.props.closeOnEsc} onHide={this.cancel.bind(this)} show={this.state.show} {...this.props}>
        {this.props.hideHeader
          ? ''
          : this.header()}
        {this.body()}
        {this.props.hideFooter
          ? ''
          : this.footer()}
      </Modal>
    );
  }
}

var _resolve;
var _reject;

export class Confirm extends FSModal {
  show(state) {
    var state = state || {};
    state.show = true;
    this.setState(state);
    let promise = new Promise(function(resolve, reject) {
      _resolve = resolve;
      _reject = reject;
    });
    return promise;
  }
  sure() {
    _resolve(this);
  }
  cancel() {
    _reject(this);
    this.setState(defaultState);
  }
  header() {
    return (
      <Modal.Header closeButton={!this.props.hideCloseBtn}>
        <Modal.Title>
          {this.state.title}
        </Modal.Title>
      </Modal.Header>
    );
  }
  body() {
    return '';
  }
  footer() {
    return (
      <Modal.Footer>
        {
          this.props.hideCloseBtn
          ? null
          : <Button bsStyle='danger' onClick={this.cancel.bind(this)} data-stest="confirmBoxCancelBtn">
              {this.state.btnCancelText || 'No'}
            </Button>
        }
        {
          this.props.hideOkBtn
          ? null
          : <Button bsStyle='success' onClick={this.sure.bind(this)} data-stest="confirmBoxOkBtn">
              {this.state.btnOkText || 'Yes'}
            </Button>
        }
      </Modal.Footer>
    );
  }
}
FSModal.defaultProps = {
  closeOnEsc: true
};
