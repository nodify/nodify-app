// example.js
// Copyright (c) 2011-2013 Smithee, Spelvin, Agnew & Plinge, Inc.
// All Rights Reserved
//
// License for use at https://raw.github.com/nodify/nodify-app/master/LICENSE

try {
  var props = require( 'node-props' );
  var app   = require( '../nodify-app' );
} catch( e ) {
  console.log( "Caught exception while loading packages. This probably means" );
  console.log( "you haven't installed node-props. Try executing this command" );
  console.log( "and running the example again:" );
  console.log( "  npm install node-props" );
  console.log( "Once node-props is installed, start the application with" );
  console.log( "this command:" );
  console.log( "  node simple_example.js --config file://example_props.json" );
  process.exit( 2 );
}

props.read( function( properties ) {
  ( new app( properties ) ).init( function( server ) {
    console.log( 'starting server' );
    server.listen();
  } );
} );
