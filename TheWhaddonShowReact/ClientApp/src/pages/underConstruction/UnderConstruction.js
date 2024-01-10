import React from 'react';

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

