/**
 * @description
 * 自定义的checkbox组件，其默认接收 onChange和checked 属性，可以和react-bootstrap-formutil的FormGroup配合用于表单
 *
 * <FormGroup name="agree">
 *      <Radio>我同意</Radio>
 * </FormGroup>
 */
export { default } from './Radio';

/**
 * @description
 * 基于Radio的多选组件，其默认接受 value 和 onChange属性，可以和react-bootstrap-formutil的FormGroup配合用于表单
 * 多选项配置，通过data属性，其为 Array<{ value: any, label: React.ReactNode }> 类型
 *
 * <FormGroup name="agree">
 *      <RadioGroup data={[
 *          { value: 1, label: 'xxx' },
 *          { value: 2, label: 'yyy' }
 *      ]} />
 * </FormGroup>
 */
export { default as RadioGroup } from './RadioGroup';
