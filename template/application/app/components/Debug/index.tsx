export interface DebugProps {
    data: any;
    title?: string;
    maxHeight?: number;
    disabled?: boolean;
}

const Debug: React.FC<DebugProps> = ({ title = 'Debug', data, disabled, maxHeight }) => {
    return process.env.NODE_ENV === 'development' && !disabled ? (
        <pre className="react-app-debug" style={{ margin: '30px 0', overflow: 'auto', maxHeight: maxHeight }}>
            <h4>{title}：</h4>
            {JSON.stringify(data, null, 2)}
        </pre>
    ) : null;
};

export default Debug;
