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
import d3 from 'd3';
import _ from 'lodash';
import ResizeObserver from 'resize-observer-polyfill';

class KafkaGraph {
  constructor(elements, container){
    this.elements = elements;
    this.container = container;

    const d3container = this.d3container = d3.select(container);
    const svg = this.svg = d3container.append('svg');

    svg.attr({
      height:'100%',
      width: '100%'
    });

    this.renderDefs();

    this.renderLines();

    this.addEventListeners();
  }

  getRectBoxSize (el){
    const obj = {};
    obj.x = el.x || el.left;
    obj.y = el.y || el.top;
    obj.width = el.width || (el.right - el.left);
    obj.height = el.height || (el.bottom - el.top);
    return obj;
  }

  renderDefs = () => {
    const svg = this.svg;
    let defs = svg.append('svg:defs');

    defs.append('svg:marker').attr('id', 'end-arrow').attr('viewBox', '0 -5 10 10').attr('refX', "9").attr('markerWidth', 4.5).attr('markerHeight', 5).attr('orient', 'auto')
      .append('svg:path').attr('d', 'M0 -5 L10 0 L0 5').attr('fill', '#31ace2');

    defs.append('svg:marker').attr('id', 'start-arrow')
      .attr('viewBox', '0 0 12 12').attr('refX', "4").attr('refY', "5")
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('svg:circle')
      .attr({
        cx: "5",
        cy: "5",
        r:"3"
      }).style({fill: '#31ace2'});
  }
  renderLines = () => {
    const container = this.container;
    const elements = this.elements;
    const svg = this.svg;

    const containerRect = container.getBoundingClientRect();
    _.each(elements, (e) => {
      const fromRect = e.from.getBoundingClientRect();
      const toRect = e.to.getBoundingClientRect();
      // fromRect => Fix for cross browser
      const c_Box = this.getRectBoxSize(containerRect);
      const f_Box = this.getRectBoxSize(fromRect);
      const t_Box = this.getRectBoxSize(toRect);

      const x1 = f_Box.x-c_Box.x+f_Box.width,
        x2 = t_Box.x-c_Box.x,
        y1 = f_Box.y-c_Box.y+(f_Box.height/2),
        y2 = t_Box.y-c_Box.y+(t_Box.height/2);

      // const x1 = fromRect.x-containerRect.x+fromRect.width,
      //   x2 = toRect.x-containerRect.x,
      //   y1 = fromRect.y-containerRect.y+(fromRect.height/2),
      //   y2 = toRect.y-containerRect.y+(toRect.height/2);

      var dateset = [
        { "x": x1,   "y": y1},
        { "x": x1+15,   "y": y1},
        { "x": x2-22,  "y": y2},
        { "x": x2,  "y": y2}
      ];

      var lineFunction = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("basis");

      svg.append("path")
        .classed('line', true)
        .attr("d", lineFunction(dateset))
        .attr("stroke", "#31ace2")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr('marker-end', "url(#end-arrow)")
        .attr('marker-start', "url(#start-arrow)");
    });
  }
  removeLines = () => {
    this.svg.selectAll('path.line').remove();
  }
  addEventListeners = () => {
    const resizerObj = new ResizeObserver.default((entries, observer) => {
      this.removeLines();
      this.renderLines();
    });
    resizerObj.observe(this.container);
  }
}

class KafkaOverlay {
  constructor(elements){
    this.elements = elements;
    const container= this.container = document.querySelector('.kafka-graph-overlay-container');

    container.style.height = document.querySelector('html').scrollHeight + 'px';
    const d3container = this.d3container = d3.select(container);
    d3container.classed('displayNone', false);

    this.Graph = new KafkaGraph(elements, container);
    this.addEventListeners();
  }
  addEventListeners(){
    const {d3container, elements} = this;
    d3container.on('click', () => {
      if(d3.event.target != this.Graph.svg.node()) {return;}
      this.close();
    });
    _.each(elements, (e) => {
      d3.select(e.from).classed('graph-content-zIndex', true);
      const d3to = d3.select(e.to);
      if(d3to.classed('hb')){
        d3.select(e.to.parentElement.parentElement.parentElement).classed('graph-content-zIndex', true);
      } else if (d3to.classed('progress-baar-start')){
        d3.select(e.to.parentElement.parentElement).classed('graph-content-zIndex', true);
      } else {
        d3to.classed('graph-content-zIndex', true);
      }
    });
  }
  close(){
    const {d3container, elements} = this;
    d3container.classed('displayNone', true);
    d3container.html('');

    _.each(elements, (e) => {
      d3.select(e.from).classed('graph-content-zIndex', false);

      const d3to = d3.select(e.to);
      if(d3to.classed('hb')){
        d3.select(e.to.parentElement.parentElement.parentElement).classed('graph-content-zIndex', false);
      } else if (d3to.classed('progress-baar-start')){
        d3.select(e.to.parentElement.parentElement).classed('graph-content-zIndex', false);
      } else {
        d3to.classed('graph-content-zIndex', false);
      }
    });
    this.onClose();
  }
  onClose(){}
}

class KafkaInline {
  constructor(elements, container){
    this.Graph = new KafkaGraph(elements, container);
  }
}

const getElementsToConnect = (data, container) => {
  return [{
    from: document.querySelector('.side-widget-list li'),
    to: document.querySelectorAll('.hb').item(2)
  },{
    from: document.querySelector('.side-widget-list li'),
    to: document.querySelectorAll('.hb').item(1)
  }, {
    from: document.querySelectorAll('.panel').item(2),
    to: document.querySelectorAll('.side-widget').item(1).querySelector('li')
  },{
    from: document.querySelectorAll('.panel').item(1),
    to: document.querySelectorAll('.side-widget').item(1).querySelector('li')
  }];
};

export {
  KafkaOverlay,
  KafkaInline,
  getElementsToConnect
};
