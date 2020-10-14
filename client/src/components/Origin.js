import fetch from 'isomorphic-fetch';
import React, {Fragment, useState} from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import {useHistory} from "react-router";
import {withRouter} from 'react-router-dom'


const Origin = (dispatch, ownProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const [multiSelections, setMultiSelections] = useState([]);
    const [status, setStatus] = useState([]);
    const name = localStorage.getItem('topo_name')
    const history = useHistory();

    function handleSelection(e) {
        setMultiSelections(e);
        console.log(e);
        localStorage.setItem('topo_origin', e);
    };

    function handleContinue(props) {

        // submit data
        // cities=Groningen,Amsterdam
        fetch("/createuser?name=" + name + "&origin=" + multiSelections, {
            method: 'POST'
        })
            .then((resp) => resp.json())
            .then((result) => {
                setStatus(result.user_id);
                console.log(result.user_id);
                localStorage.setItem('topo_user_id', result.user_id);
                history.push("/province")
            });
    }

    function handleSearch(query) {
        setIsLoading(true);

        fetch('/citynames')
            .then((resp) => resp.json())
            .then((result) => {
                setOptions(result);
                console.log(result);
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