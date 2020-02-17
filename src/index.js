import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import dayjs from 'dayjs'
import 'dayjs/locale/it'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import registerServiceWorker from './registerServiceWorker'
import './theme/index.scss';


dayjs.extend(customParseFormat)
dayjs.extend(relativeTime)
dayjs.locale('it')

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
