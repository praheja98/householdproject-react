import React,{Component} from 'react';
import {Form,Button} from 'react-bootstrap';
import '../App.css';
class Register extends Component {

constructor(props) {
    super(props);
    this.state = {
        username:'',
        password:'',
        confPassword:''
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUsername = this.handleUsername.bind(this);
    this.handlePassword = this.handlePassword.bind(this);
    this.handleRePassword = this.handleRePassword.bind(this);
}

handleUsername(event) {
    event.preventDefault();
    this.setState({username:event.target.value});
}

handlePassword(event) {
    event.preventDefault();
    this.setState({password:event.target.value});
}

handleRePassword(event) {
    event.preventDefault();
    this.setState({confPassword:event.target.value});
}

handleSubmit(event) {

    event.preventDefault();
    console.log(this.state);
    fetch('http://localhost:3017/processReg1' , {
    method:'POST',
    credentials:'include',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
        uname:this.state.username,
        pword:this.state.password,
        pword2:this.state.confPassword
    })
    })
    .then(response => response.json())
    .then(data => {
    console.log('test completed');
    console.log(data);
    console.log('test completed 1');
    
    })
    
    }

render() {

    return (

        <Form id="register">
            <Form.Label> Enter email </Form.Label>
            <Form.Control type='text' placeholder='Enter email' onChange={this.handleEmail} />
            <Form.Label> Enter username</Form.Label>
            <Form.Control type='text' placeholder='Enter username' onChange={this.handleUsername}/>
            <Form.Label> Enter password </Form.Label>
            <Form.Control type='password' placeholder='Enter password' onChange={this.handlePassword}/>
            <Form.Label> Re Enter Password </Form.Label>
            <Form.Control type='password' placeholder='Re Enter password' onChange={this.handleRePassword}/>
            <Button variant='primary' onClick={this.handleSubmit}> Register </Button>

        </Form>


    )




}

}

export default Register;
