import { lazy, Suspense } from 'react';
import Loading from 'app/components/Loading';

const AsyncDemo = lazy(() => import('../Demo'));

const App: React.FC<{}> = () => {
    return (
        <div className="first-app container">
            <h3 className="text-center">tiger-new</h3>
            <blockquote>
                <p>
                    To get started, edit <code>app/index.tsx</code> and save to reload.
                </p>
            </blockquote>
            <Suspense fallback={<Loading />}>
                <AsyncDemo />
            </Suspense>
        </div>
    );
};

export default App;
