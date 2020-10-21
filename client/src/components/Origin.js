import fetch from 'isomorphic-fetch';
import React, {useState} from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import {useHistory} from "react-router";


const Origin = (dispatch, ownProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const [multiSelections, setMultiSelections] = useState([]);
    const [status, setStatus] = useState([]);
    const name = localStorage.getItem('topo_name')
    const history = useHistory();

    function handleSelection(e) {
        setMultiSelections(e);
        localStorage.setItem('topo_origin', e);
    };

    function handleContinue(props) {
        fetch((typeof(process.env.REACT_APP_API_HOST) !== 'undefined' ? process.env.REACT_APP_API_HOST : '') + "/createuser?name=" + name + "&origin=" + multiSelections, {
            method: 'POST'
        })
            .then((resp) => resp.json())
            .then((result) => {
                setStatus(result.user_id);
                localStorage.setItem('topo_user_id', result.user_id);
                history.push("/province")
            });
    }

    function handleSearch(query) {
        setIsLoading(true);

        fetch('http://localhost:5000/citynames')
            .then((resp) => resp.json())
            .then((result) => {
                setOptions(result);
                setIsLoading(false);
            });
    }

    return (
        <div className="center-box">
            <h1>Where have you lived before?</h1>
            <p>Just type in the dutch cities that you have lived in for at least a year.</p>
            <div className="filler-40"></div>
            <div className="max-600">
                <Form>
                    <Form.Group style={{marginTop: '20px'}}>
                        <Form.Label>Just start typing the cities:</Form.Label>
                        <AsyncTypeahead
                            multiple
                            id="async-example"
                            isLoading={isLoading}
                            minLength={3}
                            onChange={handleSelection}
                            onSearch={handleSearch}
                            options={options}
                            placeholder="Search for dutch cities"
                        />
                    </Form.Group>
                    <Button onClick={handleContinue} variant="yellow" size="lg" color="blue" block>
                        Continue
                    </Button>
                </Form>
            </div>
        </div>
    )
};
/* example-end */

export default Origin;