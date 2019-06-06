/**
 * @description
 * 自定义的checkbox组件，其默认接收 onChange和checked 属性，可以和react-bootstrap-formutil的FormGroup配合用于表单
 *
 * <FormGroup name="agree">
 *      <Checkbox>我同意</Checbox>
 * </FormGroup>
 */
export { default } from './Checkbox';

/**
 * @description
 * 基于Checkbox的多选组件，其默认接受 value 和 onChange属性，其中value为数组，可以和react-bootstrap-formutil的FormGroup配合用于表单
 * 多选项配置，通过data属性，其为 Array<{ value: any, label: React.ReactNode }> 类型
 *
 * <FormGroup name="agree">
 *      <CheckboxGroup data={[
 *          { value: 1, label: 'xxx' },
 *          { value: 2, label: 'yyy' }
 *      ]} />
 * </FormGroup>
 */
export { default as CheckboxGroup } from './CheckboxGroup';
