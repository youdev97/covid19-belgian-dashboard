'use strict';

// tag::vars[]
const React = require('react'); // <1>
const ReactDOM = require('react-dom'); // <2>
// end::vars[]

ReactDOM.render(
  <React.StrictMode>
    <p>test</p>
  </React.StrictMode>,
  document.getElementById('react')
);