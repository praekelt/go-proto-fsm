go-proto-fsm
============

Prototype of a new Vumi Go campaign manager UI (also known as the spaghetti monster).

# Install dependencies

First install Bower, Grunt and Nodemon globally using npm:

    npm install -g bower
    npm install -g grunt
    npm install -g nodemon

then install the project dependencies:

    npm install
    bower install

# Running the app in development

First run 

	grunt concat 

to build the CSS and JS files. Then run

    grunt watch &
    nodemon app

and visit [http://localhost:3000](http://localhost:3000) in your browser.

# Running the tests

    npm install -g karma-cli
    karma start
