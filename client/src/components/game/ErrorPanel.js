import React from 'react';

export default class ErrorPanel extends React.Component {
    render() {
        return (<div className="error-panel">
            <ul>
                {this.props.errorMessages.map(errorMsg => {
                    return <li>{errorMsg}</li>
                })}
            </ul>
        </div>)
    }
}
