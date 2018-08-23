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
import {notifyTextLimit} from '../utils/Constants';

class ParagraphShowHideComponent extends Component{
  constructor(props){
    super(props);
    this.state = {
      data: false,
      text: "Read more"
    };
  }

  showMore = () => {
    if (this.state.text === "Read more") {
      this.setState({text: "Hide", data: true});
    } else {
      this.setState({text: "Read more", data: false});
    }
  }

  getIntialTextFromContent = (content) => {
    const {showMaxText} = this.props;
    return {
      initial : content.substr(0, showMaxText || notifyTextLimit),
      moreText : content.substr(showMaxText || notifyTextLimit)
    };
  }

  getATag = () => {
    const {text} = this.state;
    const {linkClass} = this.props;
    return  <a  className={!!linkClass ? `pull-right ${linkClass}` : ""} href="javascript:void(0)" onClick={this.showMore}>{text}</a>;
  }

  render(){
    const {text, data} = this.state;
    const {content} = this.props;
    const {initial,moreText} = this.getIntialTextFromContent(content);
    const readMore = this.getATag(text);
    return (
      <div>
        {initial}
        {text === 'Read more' && moreText.length > 0 ? '...' : null}
        {(data)
          ? moreText
          : null
        }
        <div>
          {(moreText.length > 0)
            ? this.getATag()
            : null
          }
        </div>
      </div>
    );
  }
}

export default ParagraphShowHideComponent;
