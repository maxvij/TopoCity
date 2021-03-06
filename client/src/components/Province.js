import React from 'react'
import {Button, Container, Row, Col} from "react-bootstrap";
import {withRouter} from 'react-router-dom';

class Province extends React.Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
        this.state = {
            provinces: [],
            province: '',
            loading: true
        }
    }

    handleSelect(province) {
        this.setState({province: province})
        localStorage.setItem('topo_province', province);
        this.props.history.push('/slider');
    }

    componentDidMount() {
        fetch((typeof (process.env.REACT_APP_API_HOST) !== 'undefined' ? process.env.REACT_APP_API_HOST : '') + '/provinces')
            .then(res => res.json())
            .then((data) => {
                this.setState({provinces: data, loading: false})

            })
            .catch(console.log)
    }

    render() {
        return (
            <div className="center-box">
                <div className="max-600">
                    <h1>What province do you want to study today?</h1>
                    <p>For this User Models experiment, you can only select Groningen and Friesland. You will learn both provinces during this session.</p>
                    <div className="filler-40"></div>
                    <Container>
                        {/* Stack the columns on mobile by making one full-width and the other half-width */}
                        <Row>
                            {this.state.loading ? <p style={{textAlign: 'center', width: '100%'}}>Fetching provinces...</p> : this.state.provinces.map((province, index) => (
                                <Col xs={6} md={6} key={index}>
                                    <Button disabled={(province !== "Groningen" && province !== "Friesland")} variant="blue"
                                            onClick={() => this.handleSelect(province)} size="lg" color="blue" block>
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