import React from 'react';
import {
  Container,
  Form,
  FormGroup,
  Input,
  Button,
} from 'reactstrap';
import { Link } from 'react-router-dom';

import underConstruction from '../../images/under-construction.png'; 
import s from './UnderConstruction.module.scss';


 function UnderConstruction() {

     return (
         <>
             <h1>Under Construction</h1>
             <img src={underConstruction} alt="Under Construction" width="70%" />
         </>
         

     )

}
export default UnderConstruction;

