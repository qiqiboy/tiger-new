import { createRoot, hydrateRoot } from 'react-dom/client';
import App from 'modules/App';

const rootNode = document.getElementById('wrap')!;

if (__SSR__) {
    hydrateRoot(rootNode, <App />);
} else {
    createRoot(rootNode).render(<App />);
}
