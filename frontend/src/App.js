import * as React from 'react';
import Codemynames from './Codemynames'
import { HashRouter } from 'react-router-dom';


function App (props) {
  return (
    <div>
      <HashRouter>
        <Codemynames />
      </HashRouter>
    </div>
  );
};

export default App