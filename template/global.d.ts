// 声明资源文件类型
declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.bmp'
declare module '*.tiff'

/**
 * From T delete a set of properties P
 */
type Omit<T, P> = Pick<T, Exclude<keyof T, P>>;

/**
 * create HOC(Higher Order Component)
 *
 */
type HOC<InjectProps> = <Self>(Component: React.ComponentType<Self & InjectProps>) => React.ComponentType<Self>;
