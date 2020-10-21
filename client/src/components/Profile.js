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
            }
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
        fetch('http://localhost:5000/users')
            .then(res => res.json())
            .then((res) => {
                this.setState({profiles: res, loading: false})
            })
            .catch(console.log)
    }

    render() {
        return (
            <div className="center-box">
                <h1>Nice that you're here!</h1>
                <div className="max-400">
                <div className="filler-40"></div>
                    <h3>Please create a profile to continue</h3>
                    <Button href="/name" variant="yellow" size="lg" color="blue" block>
                        Create a new profile
                    </Button>
                </div>
            </div>

        );
    }
}

export default withRouter(Profile)