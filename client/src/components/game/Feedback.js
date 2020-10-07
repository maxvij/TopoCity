import React from 'react';

export default class Feedback extends React.Component {
    render() {
        return (<div className="feedback-messages">
            <ul>
                {this.props.feedbackMessages.map((feedbackMsg, index) => {
                    return <li key={index} className={"alert" + (feedbackMsg.correct ? " green" : " red")}><p>{feedbackMsg.message}</p></li>
                })}
            </ul>
        </div>)
    }
}



