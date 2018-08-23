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


// Creates a hot reloading development environment

const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
// const DashboardPlugin = require('webpack-dashboard/plugin');
const config = require('./config/webpack.config.development');

// -dev-clusters-
const init = require('./dev-clusters/init');
const identity = require('./dev-clusters/identity');
const plugins = require('./dev-clusters/plugins');

const lakes = require('./dev-clusters/lakes');
const clusters = require('./dev-clusters/clusters');
const service_config_versions = require('./dev-clusters/service_config_versions');
const host_components = require('./dev-clusters/host_components');

const services_smm = require('./dev-clusters/services_smm');
const services_grafana = require('./dev-clusters/services_grafana');
const services_atlas = require('./dev-clusters/services_atlas');


// -/dev-clusters-

const app = express();
const compiler = webpack(config);

// Apply CLI dashboard for your webpack dev server
// compiler.apply(new DashboardPlugin());

const ui_host = process.env.HOST || 'localhost';
const ui_port = process.env.PORT || 9999;

function log() {
  arguments[0] = '\nWebpack: ' + arguments[0];
  console.log.apply(console, arguments);
}

app.use(webpackDevMiddleware(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath,
  stats: {
    colors: true
  },
  historyApiFallback: true
}));

app.use(webpackHotMiddleware(compiler));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
});
app.use("/", express.static(__dirname + '/app'));

app.use("/assets/images", express.static(__dirname + '/node_modules/dps-apps/dist/images'));

app.get('/api/init', (req, res) => {
  res.send(init);
});
app.get('/api/identity', (req, res) => {
  res.send(identity);
});
app.get('/auth/out', (req, res) => {
  res.set('X-Authenticate-Href', ui_host);
  res.send();
});
app.get('/api/plugins', (req, res) => {
  res.send(plugins);
});

app.get('/api/lakes' , (req, res) => {
  res.send(lakes);
});
app.get('/api/clusters' , (req, res) => {
  const _cluster = clusters.filter(c => {
    return c.id == req.query.dpClusterId;
  });
  res.send(_cluster);
});
app.get('/api/clusters/:id/services' , (req, res) => {
  const serviceName = req.query.serviceName;
  if(serviceName == 'AMBARI_METRICS'){
    res.send(services_grafana);
  }else if(serviceName == 'STREAMSMSGMGR'){
    res.send(services_smm);
  }else{
    res.send(services_atlas);
  }
  
});
app.get('/cluster/cluster/:id/service/ambari/api/v1/clusters/:name/configurations/service_config_versions' , (req, res) => {
  res.send(service_config_versions[req.params.id]);
});
app.get('/cluster/cluster/:id/service/ambari/api/v1/clusters/:name/host_components' , (req, res) => {
  res.send(host_components[req.params.id]);
});

//-------------------proxy-------------------

const proxyMiddleware = require('http-proxy-middleware');
const restTarget = 'http://localhost:8585';

const context = []; // requests with this path will be proxied
const pathRewrite = {};
const proxyTable = {}; // when request.headers.host == 'dev.localhost:3000',
//proxyTable[host + ':' + port] = restTarget; // override target 'http://www.example.org' to 'http://localhost:8000'
clusters.forEach((c) => {
  const clusterId = c.id;

  const path = '/cluster/cluster/'+clusterId+'/service/smm';

  let restUrl = '';

  const json = services_smm.filter((j) => {
    return j.clusterId == clusterId;
  });

  const protocol = json[0].properties.filter(cProp => cProp.type === 'streams-messaging-manager-ssl-config')[0].properties["streams_messaging_manager.ssl.isenabled"] == 'true' ? 'https': 'http';
  const portWithoutSSL = json[0].properties.filter(cProp => cProp.type === 'streams-messaging-manager-common')[0].properties.port;
  const portWithSSL = json[0].properties.filter(cProp => cProp.type === 'streams-messaging-manager-common')[0].properties["streams_messaging_manager.ssl.port"];
  restUrl = `${protocol}://${json[0].hosts[0]}:${protocol === 'https' ? portWithSSL : portWithoutSSL}`;

  proxyTable[path] = restUrl;
  context.push(path);
  pathRewrite['^'+path] = '';

  console.log('Proxy Table', proxyTable);
});


// configure proxy middleware options
const options = {
  target: restTarget, // target host
  changeOrigin: true, // needed for virtual hosted sites
  ws: true, // proxy websockets
  router: proxyTable,
  pathRewrite: pathRewrite,
  onProxyRes: function(proxyRes, req, res) {
    if (proxyRes.headers['set-cookie']) {
      var _cookie = proxyRes.headers['set-cookie'][0];
      _cookie = _cookie.replace(/Path=\/[a-zA-Z0-9_.-]*\/;/gi, "Path=/;");
      proxyRes.headers['set-cookie'] = [_cookie];
    }
  },
  onProxyReq: function(proxyReq, req, res) {

  },
  onError: function(err, req, res) {
    console.log(err, req.url);
  }
};

const proxy = proxyMiddleware(context, options);

app.use(proxy);
//-------------------proxy-------------------

app.listen(ui_port, '0.0.0.0', (err) => {
  if (err) {
    log(err);
    return;
  }

  log('🚧  App is listening at http://%s:%s', ui_host, ui_port);
});
