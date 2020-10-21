import React from 'react'
import Button from "react-bootstrap/Button";
import {withRouter} from 'react-router-dom';

class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
        this.state = {
            profiles: [],
            loading: true,
            profile: {
                name: '',
                id: 0,
                origin: ''
            },
            connected: false
        }
    }

    handleSelect(id, name, origin) {
        this.setState({
            profile: {
                name: name,
                id: id,
                origin: origin
            }
        })
        localStorage.setItem('topo_name', name);
        localStorage.setItem('topo_user_id', id);
        localStorage.setItem('topo_origin', origin);
        this.props.history.push('/province');
    }

    componentDidMount() {
        setInterval(this.checkServerStatus, 1000)
    }

    checkServerStatus = () => {
        fetch('http://localhost:5000/status')
            .then(res => res.json())
            .then((res) => {
                this.setState({
                    connected: true
                })
            })
            .catch((err) => {
                this.setState({
                    connected: false
                })
                // console.log(err)
            })
    }

    render() {
        const helpPanel = <p>If you're having trouble setting up the server correctly, make sure to follow the steps as described in our <a target="_blank" rel="noopener noreferrer" href="https://github.com/maxvij/TopoCity">Readme at our Github repository</a>.</p>

        return (
            <div className="center-box">
                <h1>Welcome to TopoCity!</h1>
                <div className="max-400">
                <p>TopoCity is a SlimStampen-based topography learning app for the Netherlands.</p>
                <p>Thank you for willing to participate in this experiment. <br />The experiment should take approximately <strong>10 minutes</strong>.</p>
                <br />
                <p><span className={"status" + (this.state.connected ? " green" : " red")}>{this.state.connected ? 'connected to python' : 'not connected to python'}</span></p>
                    {this.state.connected === false && helpPanel}
                    {this.state.connected && <>
                        <div className="filler-40"></div>
                        <h3>Please create a profile</h3>
                        <Button href="/name" variant="yellow" size="lg" color="blue" block>
                            Create a new profile
                        </Button></>
                    }
                </div>
            </div>

        );
    }
}

export default withRouter(Profile)