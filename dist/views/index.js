/* global app:true */

(function() {
  'use strict';

  var app = {};

  app.ContainerView = Backbone.View.extend({
    el: '#weather',
    gauges: [],
    ws: {},
    temp: 0,
    name: '',
    events: {
    },
    initialize: function() {
      this.createGauge("weather", "Air Quality");
    },
    render: function() {
      var temp = this.temp;

      // Celsius
      this.gauge.redraw(temp);
    },
    update: function(e) {
      this.temp = JSON.parse(e.data).quality;
      this.render();
    },
    createGauge: function(name, label, min, max)
    {
      var size = $(window).height();
      var config =
      {
         size: size,
         label: label,
         min: undefined != min ? min : 0,
         max: undefined != max ? max : 300,
         minorTicks: 1
      }

      var range = config.max - config.min;
      config.yellowZones = [{ from: config.min + range*0.75, to: config.min + range*0.9 }];
      config.redZones = [{ from: config.min + range*0.9, to: config.max }];

      this.gauge = new Gauge(name, config);
      this.gauge.render();
    },
    syncUp: function(name) {
      this.name = name;
      this.ws = new WebSocket('ws://wot.city/object/' + this.name + '/viewer');
      this.ws.onopen = function() {
         console.log('Websocket ready.');
      };
      this.ws.onmessage = this.update.bind(this);
    },
  });

  /*
   * ROUTES
   */

  app.AppRoutes = Backbone.Router.extend({
    routes: {
      ':name': 'appByName'
    },
    appByName: function(name) {
      app.containerView = new app.ContainerView();
      app.containerView.syncUp(name);
    }
  });

  /**
   * BOOTUP
   **/

  $(function() {
    app.appRoutes = new app.AppRoutes();
    Backbone.history.start();
  });

}());
