import React from 'react'
import {Button, Container, Row, Col} from "react-bootstrap";
import {withRouter} from 'react-router-dom';

class Province extends React.Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
        this.state = {
            provinces: [],
            province: ''
        }
      }
    
    handleSelect(province) {
        this.setState({ province: province })
        localStorage.setItem('topo_province', province);
        console.log(province)
        this.props.history.push('/slider');
    }
    componentDidMount() {
        fetch(process.env.HOST + '/provinces')
        .then(res => res.json())
        .then((data) => {
            this.setState({ provinces: data })
            console.log(this.state.provinces)
            
        })
        .catch(console.log)
    }
    render() {
        return (
            <div className="center-box">   
                <div className="max-600">
                    <h1>What province do you want to study today?</h1>
                    <div className="filler-40"></div>
                    <Container>
                        {/* Stack the columns on mobile by making one full-width and the other half-width */}
                        <Row>             
                        {this.state.provinces.map((province, index) => (
                        <Col xs={6} md={6} key={index}>
                            <Button variant="blue" onClick={() => this.handleSelect(province)} size="lg" color="blue" block>
                                {province}
                            </Button>
                            <div className="filler-20"></div> 
                        </Col>
                        ))}
                        </Row>
                    </Container>
                    </div>
            </div>

        );
    }
}

export default withRouter(Province)