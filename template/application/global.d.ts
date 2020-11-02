// 声明资源文件类型
declare module '*.avif';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module '*.html';
declare module '*.txt';
declare module '*.htm';
declare module '*.css';
declare module '*.scss';
declare module '*.less';

/**
 * .svg with SVGR feature
 */
declare module '*.svg' {
    export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;

    const src: string;
    export default src;
}

/**
 * __DEV__: process.env.NODE_ENV === 'development'
 * __SSR__: whether or not enable ssr
 */
declare const __DEV__: boolean;
declare const __LOCAL_DEV__: boolean;
declare const __SSR__: 'web' | 'node' | false;

/**
 * process.env.XX
 */
declare namespace NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test';
        readonly BASE_NAME: string;
        readonly PUBLIC_URL: string;

        readonly RUNTIME: 'web' | 'node';
        readonly RUNTIME_MODE: 'csr' | 'ssr';
        readonly ENABLE_SSR: boolean;
        readonly ENABLE_PWA: boolean;
    }

    interface Global {
        __handledRejection__: boolean;
    }
}

/**
 * create HOC(Higher Order Component)
 */
type HOC<InjectProps> = <SelfProps>(
    Component: React.ComponentType<SelfProps & InjectProps>
) => React.ComponentType<Omit<SelfProps, keyof InjectProps>>;

/**
 * add [].lastItem, [].lastIndex
 */
interface Array<T> {
    readonly lastItem: T;
    readonly lastIndex: number;
}
