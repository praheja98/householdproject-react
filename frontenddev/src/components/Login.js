import React,{Component} from 'react';
import {Form,Button} from 'react-bootstrap';
import '../App.css';

class Login extends Component {

constructor(props) {
    super(props);
    this.state = {loggedIn:false , username:'' , password: ''};
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
}

handleSubmit(event) {

event.preventDefault();
fetch('http://localhost:3017/processLogin1' , {
method:'POST',
credentials:'include',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({
    uname:this.state.username,
    pword:this.state.password
})
})
.then(response => response.json())
.then(data => {
console.log('test completed');
console.log(data);
console.log('test completed 1');

})

}

handleUsernameChange(event) {
    event.preventDefault();
    this.setState({username:event.target.value});
}

handlePasswordChange(event) {
    event.preventDefault();
    this.setState({password:event.target.value});
}

componentDidMount() {

}

render() {

    return (

        <Form id='login'>
            <Form.Label> Enter username</Form.Label>
            <Form.Control type='text' placeholder='Enter username' onChange={this.handleUsernameChange} />
            <Form.Label> Enter password </Form.Label>
            <Form.Control type='password' placeholder='Enter password' />
            <Button variant='primary' onClick={this.handleSubmit}> Login </Button>

        </Form>


    )




}

}

export default Login;
