import { createRoot, hydrateRoot } from 'react-dom/client';
import App from 'modules/App';

const container = document.getElementById('root')!;

if (__SSR__) {
    hydrateRoot(container, <App />);
} else {
    createRoot(container).render(<App />);
}
