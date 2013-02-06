// nodify-app.js
// Copyright (c) 2011-2013 Smithee, Spelvin, Agnew & Plinge, Inc.
// All Rights Reserved
//
// License for use at https://raw.github.com/nodify/nodify-app/master/LICENSE

( function () {
  var _aopts = {
    flags: "a+",
    encoding: "UTF-8",
    mode: 0666
  };


  function app( options ) {
    this.options = options;
    this.servers = [];
    this.facilities = {};
  };

  if( module && module.exports ) {
    module.exports = app;
  }

  app.prototype.init = function( callback ) {
    var that = this;

    if( this.options.logger ) {
      require( 'nodify-logger' ).createInstance( this.options.logger, function ( _l, descriptor ) {
        that.facilities.logger = {
          _l: l,
          descriptor: descriptor
        };
      } );
    }

    if( this.options.persist ) {
      ( new require( 'nodify-persist' ) ).init( function( err, target ) {
        if( err ) {
          throw err;
        }

        that.facilities.dao = target;
        _complete();
      } );
    } else {
      _complete();
    }

    function _complete() {
      if( that.options.apps ) {
        var start = that.options.start;
        if( ! start ) {
          start = [];
          for( var i in apps ) {
            start.push( i );
          }
        }

        for( var i = 0, il = start.length; i < il; i++ ) {
          if( that.options.apps && that.options.apps[ start[ i ] ] ) {
            _create_server( that.options.apps[ start[ i ] ] );
          }
        }
      } else {
        _create_server( that.options );
      }

      function _create_server( o ) {
        var engine = require( o.engine || that.options.engine || 'connect' );
        var app = engine();

        var current = o.favicon || that.options.favicon;
        if( current ) {
          app.use( engine.favicon( current ) );
        }

        current = o.cookieParser || that.options.cookieParser;
        if( current ) {
          app.use( engine.cookieParser( current ) );
        }

        if( o.access ) {
          if( o.access.path ) {
            var fs = require( 'fs' );
            o.access.stream = fs.createWriteStream( o.access.path, _aopts );
          }
          app.use( engine.logger( o.access ) );
        }

        if( o.source ) {
          require( o.source ) ( app, o, that.facilities );
        }

        if( o.templates ) {
          var _t = new (require( './templates' ))( o.templates );
          app.use( '/templates', _t.middleware() );
        }

        if( o.static ) {
          var params;
          var path;
          if( 'string' == typeof o.static ) {
            path = o.static;
          } else {
            path = o.static.path;
            params = o.static;
          }
          app.use( engine.static( path, params ) );
        }

        if( o.router ) {
          app.use( app.router );
        }

        if( o.views ) {
          o.views.path && app.set( 'views', o.views.path );
          o.views.engine && app.set( 'view engine', o.views.engine );
        }

        app.use( engine.errorHandler( o.errorHandler ) );

        that.servers.push( { app: app, options: o } );
      }

      callback && callback.apply( that, [ that ] );
    }
  };

  app.prototype.listen = function () {
    for( var i = 0, il = this.servers.length; i < il; i++ ) {
      var current = this.servers[ i ];
      if( current.options.listen && current.options.listen.port ) {
        current.app.listen( current.options.listen.port, current.options.listen.host );
      }
    }
  };
} ) ( );