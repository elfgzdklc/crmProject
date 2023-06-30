export default function NoData(props) {
    return (
        <div className="py-5">
            <div className="text-danger text-center">
                <i className="fas fa-exclamation-triangle fa-4x"></i>
            </div>
            <div className="text-center mt-3 fs-6">
                {props.message}
            </div>
        </div>
    );
}
