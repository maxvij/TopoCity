import fetch from 'isomorphic-fetch';
import React, {useState} from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

const AsyncExample = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState([]);

    const handleSearch = (query) => {
        setIsLoading(true);

        fetch('http://localhost:5000/citynames')
            .then((resp) => resp.json())
            .then((result) => {
                setOptions(result);
                setIsLoading(false);
            });
    };

    return (
        <div className="center-box">
            <h1>Where have you lived before?</h1>
            <p>Please type in the dutch cities that you have lived in for at least a year.</p>
            <p>If a certain location can't be found, make sure to choose a location closeby with over 20.000 inhabitants.</p>
            <div className="filler-40"></div>
            <div className="max-400">
                <Form>
                    <Form.Group style={{marginTop: '20px'}}>
                        <Form.Label>Just start typing the cities:</Form.Label>
                        <AsyncTypeahead
                            multiple
                            id="async-example"
                            isLoading={isLoading}
                            minLength={3}
                            onSearch={handleSearch}
                            options={options}
                            placeholder="Search for dutch locations"
                        />
                    </Form.Group>
                    <Button href="../slider" variant="yellow" size="lg" color="blue" block>
                        Continue
                    </Button>
                </Form>
            </div>
        </div>
    )
};

export default AsyncExample;