import React,{Component} from 'react';
import {Form,Col,Row,Button} from 'react-bootstrap';
import '../App.css';
class BillPayment extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div className='billpayment-container' style={{backgroundColor:'coral'}}>
            <Form.Group as={Row} controlId="formHorizontalEmail">
                <Form.Label column sm={2}>
                    Enter Payment Type
                </Form.Label>
                <Col sm={10}>
                    <Form.Control type='text' placeholder='Enter Payment Type' />
                </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="formHorizontalEmail">
                <Form.Label column sm={2}>
                    Enter Amount Due
                </Form.Label>
                <Col sm={10}>   
                    <Form.Control type='text' placeholder='Enter Amount Due' />
                </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="formHorizontalEmail">
                <Form.Label column sm={2}>
                   Enter Date Due
                </Form.Label>
                <Col sm={10}>
                    <Form.Control type='date' placeholder='Enter Date Due' />
                </Col>
            </Form.Group>
            <Button variant='primary'> Make Payment </Button>
            </div>




        )

    }



}

export default BillPayment;