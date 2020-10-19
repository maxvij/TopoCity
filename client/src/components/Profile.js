import React from 'react'
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
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
        fetch((typeof(process.env.REACT_APP_API_HOST) !== 'undefined' ? process.env.REACT_APP_API_HOST : '') + '/users')
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
                <div className="filler-40"></div>
                <div className="max-400">
                <div className="filler-40"></div>
                    <h3>Have you played before?</h3>
                    {this.state.loading ? 'Fetching profiles...' : <DropdownButton variant="blue" size='lg' title="Select an existing profile">
                        {this.state.profiles.map((profile, index) => (
                            <Dropdown.Item
                                key={index}
                                onClick={() => this.handleSelect(profile.id, profile.name, profile.homes)}>{profile.name}</Dropdown.Item>
                        ))}
                    </DropdownButton>}
                    <div className="filler-40"></div>
                    <h3>Are you new here?</h3>
                    <Button href="/name" variant="yellow" size="lg" color="blue" block>
                        Create a new profile
                    </Button>
                </div>
            </div>

        );
    }
}

export default withRouter(Profile)