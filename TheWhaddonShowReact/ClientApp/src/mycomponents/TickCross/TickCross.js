import React from 'react';


export default function TickCross (value) {

    if (value) { return <div className="icon-list-item danger"><span className="glyphicon glyphicon-ok" /></div> }

    return <div className="icon-list-item" ><span className="glyphicon glyphicon-remove" /></div>
}