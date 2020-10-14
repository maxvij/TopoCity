import React from 'react'
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
        this.state = {
            profiles: [],
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
            } })
        localStorage.setItem('topo_name', name);
        localStorage.setItem('topo_user_id', id);
        localStorage.setItem('topo_origin', origin);
        // console.log(profile)
        // this.props.history.push('/province');
    }
    componentDidMount() {
        fetch('/users')
        .then(res => res.json())
        .then((res) => {
            this.setState({ profiles: res })
            console.log(res)
        })
        .catch(console.log)
    }
    render() {
        return (
            <div className="center-box">
                <h1>Hi, who are you?</h1>
                <div className="filler-40"></div>
                <div className="max-400">
                <DropdownButton id="dropdown-basic-button" size='lg' title="Select an existing profile">
                {this.state.profiles.map((profile, index) => (
                    <Dropdown.Item onClick={() => this.handleSelect(id, name, origin)}>{name}</Dropdown.Item>
                    ))}   
                
                </DropdownButton>
                    
                    <Button href="/name" variant="yellow" size="lg" color="blue" block>
                        New Learner
                    </Button>

                </div>
            </div>

        );
    }
}

export default Profile