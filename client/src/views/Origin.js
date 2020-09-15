import React, {useState} from 'react'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Typeahead } from 'react-bootstrap-typeahead';
import options from '../data';
import 'react-bootstrap-typeahead/css/Typeahead.css';

const useStateWithLocalStorage = localStorageKey => {
  const [value, setValue] = React.useState(
    localStorage.getItem(localStorageKey) || ''
  );
 
  React.useEffect(() => {
    localStorage.setItem(localStorageKey, value);
  }, [value]);
 
  return [value, setValue];
};

const Origin = () => { 
    const [value, setValue] = useStateWithLocalStorage(
      'topo_name'
    );
    const [multiSelections, setMultiSelections] = useState([]);
    const onChange = event => setValue(event.target.value);
    return (
      <div className="center-box" >
          <h1>Where have you lived before?</h1>
          <p>Just type in the dutch cities that you have lived in for at least a year.</p>
          <div className="filler-40"></div>
          <div className="max-400">         
            <Form> 
            <Form.Group style={{ marginTop: '20px' }}>
              <Form.Label>Just start typing the cities:</Form.Label>
              <Typeahead
                id="basic-typeahead-multiple"
                labelKey="name"
                multiple
                onChange={setMultiSelections}
                options={options}
                placeholder="Choose several cities..."
                selected={multiSelections}
              />
            </Form.Group>           
              <Button href="../slider" variant="yellow" size="lg" color="blue" block>
              Continue
              </Button>
            </Form> 
          </div>
      </div>
      
  );
  
}
export default Origin;