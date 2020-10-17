import AnswerButton from "../AnswerButton";
import React from "react";
import Button from "react-bootstrap/Button";

export default class GamePanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: ''
        }
    }

    handleSubmit = (event) => {
        event.preventDefault();
        let correctAnswer = this.props.currentFact[2].toLowerCase();
        let inputAnswer = this.state.value.replace(/\s/g, '').toLowerCase();
        if(correctAnswer === inputAnswer) {
            this.props.logCorrectResponse()
        } else {
            this.props.logIncorrectResponse()
        }
        this.clearInput()
    }

    handleChange = (event) => {
        this.setState({
            value: event.target.value
        })
    }

    clearInput = () => {
        this.setState({
            value: ''
        })
    }

    render() {
        const multipleChoice = (<>
            {this.props.loading ?
                    <div className="loading">
                        <p>Fetching...</p>
                    </div>
                    : this.props.answerOptions.map((fact, index) => {
                        return <AnswerButton key={index} name={fact[2]}
                                             correct={fact[2] === this.props.currentFact[2]}
                                             correctAction={this.props.logCorrectResponse}
                                             incorrectAction={this.props.logIncorrectResponse}
                                             isNew={(fact[2] === this.props.currentFact[2]) && this.props.isNewFact}
                        >{fact[2]}</AnswerButton>
                    })}
        </>)

        const textInput = (<form>
            <input autoFocus={true} type="text" name="answer" id="answer" onChange={this.handleChange} value={this.state.value}/>
            <Button type="submit" variant="blue" size="lg" color="blue" block onClick={this.handleSubmit}>Submit</Button>
        </form>)

        return (<div className="vote-panel" id={this.props.currentFact[2]}>
            <h1>What's the name of this city?</h1>
            <div className="filler-20"></div>
            <div className="max-400">
                {this.props.responseError ? 'error' : ''}
                {this.props.activationLevel > .5 ? textInput : multipleChoice}
                <div className="filler-20"></div>
            </div>
        </div>)
    }
}