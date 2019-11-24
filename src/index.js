import React from 'react'
import ReactDOM from 'react-dom'
import CssBaseline from '@material-ui/core/CssBaseline'
import Example from './example/Example'

// Inject render debugging tool
if (process.env.NODE_ENV !== 'production') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React);
}

ReactDOM.render((
    <div>
        <CssBaseline />
        <Example />
    </div>
), document.getElementById("root"));
