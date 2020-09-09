import React from 'react'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import "../custom.scss";

const useStateWithLocalStorage = localStorageKey => {
  const [value, setValue] = React.useState(
    localStorage.getItem(localStorageKey) || ''
  );
 
  React.useEffect(() => {
    localStorage.setItem(localStorageKey, value);
  }, [value]);
 
  return [value, setValue];
};

const Name = () => {
  
  
    const [value, setValue] = useStateWithLocalStorage(
      'topo_name'
    );
    const onChange = event => setValue(event.target.value);
    return (
      <div className="center-box" >
          <h1>How do you want to be called?</h1>
          <div className="filler-40"></div>
          <div className="max-400">         
            <Form> 
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Your name:</Form.Label>
                <Form.Control type="text" value={value} type="text" onChange={onChange} size="lg" placeholder="e.g. Lord Voldemort" />
              </Form.Group>             
              <Button href="../origin" variant="yellow" size="lg" color="blue" block>
              Let's go!
              </Button>
            </Form> 
          </div>
      </div>
      
  );
  
}
export default Name;