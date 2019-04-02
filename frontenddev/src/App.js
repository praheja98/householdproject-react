import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Register from './components/Register.js';
import Login from './components/Login.js';
import BillPayment from './components/BillPayment';
import {Switch , Route} from 'react-router';
import {BrowserRouter} from 'react-router-dom';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
      <div>
        <Switch>
          <Route exact path='/' component={Login} />
          <Route exact path='/register' component={Register} />
          <Route exact path='/billpayment' component={BillPayment} />
        </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
