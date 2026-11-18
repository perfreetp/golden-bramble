import { render } from 'solid-js/web';
import './styles.css';
import App from './App';
import { loadState, seedIfEmpty } from './state/store';

if (!loadState()) seedIfEmpty();

render(() => <App />, document.getElementById('root'));
