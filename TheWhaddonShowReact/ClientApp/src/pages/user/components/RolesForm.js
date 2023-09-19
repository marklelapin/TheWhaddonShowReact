import React from 'react';
import CheckBox from '../../../components/Forms/CheckBox';

function RolesForm(props) {

    const { person, strapColor, onIsActorChange, onIsSingerChange, onIsWriterChange, onIsBandChange,onIsTechnicalChange,onIsAdminChange} = props 

    return (
        <div id="roles-form" className="draft-border">
            <CheckBox id="isActor" strapColor={strapColor} label="Actor" checked={person.IsActor} onChange={onIsActorChange} />
            <CheckBox id="isSinger" strapColor={strapColor} label="Singer" checked={person.IsSinger} onChange={onIsSingerChange} />
            <CheckBox id="isWriter" strapColor={strapColor} label="Writer" checked={person.IsWriter} onChange={onIsWriterChange} />
            <CheckBox id="isBand" strapColor={strapColor} label="Band" checked={person.IsBand} onChange={onIsBandChange} />
            <CheckBox id = "isTechnical" strapColor={strapColor} label="Technical" checked={person.IsTechnical} onChange={onIsTechnicalChange} />
            <CheckBox id ="isAdmin" strapColor={strapColor} label="Admin" checked={person.IsAdmin} onChange={onIsAdminChange} />
        </div>

    )

}

export default RolesForm
    ;