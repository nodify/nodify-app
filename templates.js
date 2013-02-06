( function () {
  var fs = require( 'fs' );
  var path = require( 'path' );

  function templates( path ) {
    var that = this;
    this.path = path;
    this.read();
    fs.watch( this.path, function( event, filename ) {
      if( 'change' == event ) {
        setTimeout( function () {
          that.read();
        }, 500 );
      }
    } );
  }

  if( module && module.exports ) {
    module.exports = templates;
  }

  templates.prototype.read = function () {
    this.templates = {};
    var re = /\_/g;
    var items = fs.readdirSync( this.path );
    for( var i in items ) {
      var item = items[ i ];
      var components = item.split('.');
      if( components.length > 1 ) {
        var extension = components[ components.length - 1 ];
        if( 'html' === extension ) { 
          var name = components.slice( 0, components.length - 1 ).join( '.' ).replace(re,'/');
          try {
            var contents = fs.readFileSync( path.join( this.path, item ), 'utf8' );
            this.templates[ name ] = contents;
          } catch( e ) {
            console.log( e.toString() );
          }
        }
      }
    }
  };

  templates.prototype.getTemplates = function () {
    return this.templates;
  };

  templates.prototype.middleware = function () {
    var that = this;

    return function( request, response, next ) {
      var output = JSON.stringify( that.getTemplates() );
      response.writeHead( 200, { "Content-Length": output.length,
                                 "Content-Type": 'application/json' } );
      response.end( output );
    };
  };
} )();