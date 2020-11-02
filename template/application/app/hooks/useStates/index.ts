import { useReducer } from 'react';

function reducer(state, action) {
    return { ...state, ...action };
}

/**
 * @description
 * 基于useReducer封装的混合可以灵活使用类似class component的setState类似混入形式的state
 *
 * 用法一
 * const [state, setState] = useStates({
 *      loading: true,
 *      error: null,
 *      data: null
 * });
 *
 * console.log(state.loading);
 *
 * setState({
 *      loading: false
 * });
 *
 * 用法二
 *
 * function initializer(props) { // 初始构造器，其参数为传递给useStates的第一个参数
 *      return {
 *          loading: true,
 *          data: props.data
 *          ...
 *      }
 * }
 * const [state, setSatte] = useStates(props, initializer)
 *
 */

function useStates<InitialState extends object>(
    initialState: InitialState
): [InitialState, (newState: Partial<InitialState>) => void];

function useStates<InitialState extends object, I = any>(
    initializerArg: I,
    // eslint-disable-next-line
    initializer: (arg: I) => InitialState
): [InitialState, (newState: Partial<InitialState>) => void];

function useStates(initialState: any, initializer?: any) {
    const [state, dispatch] = useReducer(reducer, initialState, initializer);

    return [state, dispatch];
}

export default useStates;
