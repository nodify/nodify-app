nodify-app
==========

Simple app framework for Node.JS apps.

# Introduction

nodify-app uses the node-props package
to read global properties for a node app. It then initializes various services
based on the props file contents.

The objective is to move the initialization of services from code to a
declarative properties file so an application's config state can be easily
stored in a file or http resource.

The benefits include:
1. Moving app configuration information from environment variables into JSON
   files.
1. Many configuration changes (moving from connect to express, changing database
   references, including various packages) require changing a config file, not
   a code change.

# Usage (Simple)

The simplest way to use nodify-app is to use the 'nodify-app' command, passing
it the name of one or more configuration files:

<pre>nodify-app --config file://production.json</pre>

This usage uses the node-props package to read the configuration file
("production.json" in this case) and start a node service based on the contents
of the config file.

Here's a very simple configuration file:

<pre>{
  "favicon": "static/favicon.ico",
  "access": {
    "path": "logs/sample_access.csv",
    "format": "\":date\",\":req[x-forwarded-for]\",\":method\",\":status\",\":req[host]\",\":url\",\":referrer\",\":user-agent\""
  },
  "static": {
    "path": "static",
    "maxAge": 14400000
  },
  "listen": {
    "port": 8080
  }
}</pre>

This config file would start a connect.js server, calling use() with parameters
appropriate to:

* setup a static file store in the 'static' directory
* open an access log in the file 'logs/sample_access.csv'
* use favicon.ico as the site's icon
* and finally, listen on port 8080 on all interfaces.

A complete guide to nodify-app config file parameters are provided below.

# Usage (More Complex)

The nodify-app package includes a "plain 'ol package" you can use in your own
code in case you want to extend it or grab the config file from somewhere other
than the command line.

Here's an example of it's use:

<pre>var app = require( 'nodify-app' );
var props = require( 'node-props' );

console.log( "Reading configuration file(s)." );

props.read( function ( g ) {
  console.log( "Initializing application." );
  var server = ( new app( g ) ).init( function ( err ) {
    if( err ) {
      throw err;
    }
    console.log( "Listening on port " + g.listen.port );
    server.listen();
  } );
} );</pre>

There are really only three public methods for nodify-app: the constructor,
init() and listen().

* new app() - You create a new application instance in the traditional manner
by calling it's constructor, passing the configuration object (described below)
as a parameter.
* init() - This method parses config object, creating appropriate instances
of objects and calling use() when needed. It does just about everything you
need to do save calling the listen() method. Keep in mind this can involve I/O,
so you need to provide a callback function to be executed after initialization.
* listen() - This method calls the listen() method on all servers defined in
the config object.

# Config File / Object Reference

## Basic Configuration Properties

*engine* - "connect" or "express"

nodify-app can use either connect.js or express.js as a base to build a server.
By default, connect is used.

*bodyParser* - true

If the bodyParser property is present in the configuration option and is set
to a non-false value (like the boolean true value), the connect.js bodyParser
middleware will be used.

*cookieParser* - true or string

If the cookieParser property is present and set to a non-false value, the
cookieParser middleware will be used. If the property's value is a string,
it will be passed to the connect.cookieParser() call as the "optional secret
string" parameter.

*favicon* - string

This property tells nodify-app to use the connect.favicon() middleware. It's
placed before the access middleware, so favicon requests will not appear in 
the access log.

*static* - string or object

If this property is present, it is either that name of a directory containing
static files to serve up. Or it is an object passed to the connect.static()
middleware.

*errorHandler* - object

If present, it is passed to the connect.errorHandler() middleware.

*listen* - object

This object contains the port and host properties which are used to determine
the port and IP address to listen on.

Here's an example of an extremely basic configuration that uses connect.js to
listens on port 8080, serving files out of a directory called "public":

<pre>{
  "static": "public",
  "listen": {
    port: 8080
  }
}</pre>

## Express.js properties

These config properties are useful only when using express.js as your engine.

*views* - object

This property contains an object with "path" and "engine" properties. The
path proerty describes where the view templates will be located while the
engine property identifies which engine ("hbs", "jade", etc.) to use.

*router* - true

If this property is present, it causes the express router middleware to be
used. This is the equivalent of calling <code>app.use( app.router );</code>.

## nodify-app properties

These properties are used to configure nodify-app's "advanced" features:

*persist* - object

If present, the nodify-persist package will be required and this property,
which describes database options will be passed to it's constructor.

*logger* - object

If present, causes the nodify-logger package to be required. This property
will be passed to the nodify-logger constructor.

*access* - object

If present, it creates an instance of the connect.js logger() object using
the "format" property. If the path property is present, a file stream will
be opened and passed to the logger() constructor.

*templates* - string

This property is the path to the templates directory. If present, the system
will scan the directory for HTML fragments, and making them available to
web clients as '/templates.json'. It is intended to be an easy way to deliver
a large number of HTML templates in one request.

*source* - string or object

If present, the file (or files) referenced will be required and called passing
the facilities object and the application's defaults.

*apps* - object

To start multiple servers listening on different ports, include an apps property
whose value is an object whose properties are app descriptors.

*start* - object

By default nodify-app starts all servers described in the apps section. If this
array of strings is present, only those servers listed here will be started.

Here's an example:

<pre>{
  "persist": {
    "log": {
      "level": 1
    },
    "providers": {
      "localdb": {
        "host": "localhost",
        "database": "testing",
        "user": "testuser",
        "password": "as if i would list a password here"
      },
      "collections": {
        "identity": "collection_identity",
        "session": "collection_session"
      }
    }
  },
  "logger": {
    "facility": "EXAMPLE",
    "messages_path": "example_messages.json"
  },
  "start": [ "main" ],
  "apps": {
    "main": {
      "template": {
        "path": "templates"
      },
      "access": {
        "path": "logs/main_access.csv",
        "format": "\":date\",\":req[x-forwarded-for]\",\":method\",\":status\",\":req[host]\",\":url\",\":referrer\",\":user-agent\""
      },
      "static": {
        "path": "static",
        "maxAge": 14400000
      },
      "listen": {
        "port": 8080
      }
    },
    "admin": {
      "template": {
        "path": "admin/templates"
      },
      "access": {
        "path": "logs/admin_access.csv",
        "format": "\":date\",\":req[x-forwarded-for]\",\":method\",\":status\",\":req[host]\",\":url\",\":referrer\",\":user-agent\""
      },
      "static": {
        "path": "admin/static",
        "maxAge": 14400000
      },
      "source": "src/logic_admin",
      "listen": {
        "port": 8085
      }
    }
  }
}</pre>