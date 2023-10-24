import React from 'react';
import {useState, useEffect} from 'react'; 
import {useSelector, useDispatch} from 'react-redux'; 
import  TagsInput  from 'components/Forms/TagsInput';
import { Button } from 'reactstrap';
//Components
import { Input } from 'reactstrap';
function ScriptSearch(props) {

    const { tags = [], onChange} = props;

    const tagOptions = ['Guy To Do','Mark to Do','Heather to Do']



    return (

        <div className="script-search">

            <Input
                type="text"
                name="search"
                id="search"
                placeholder="Search"
            />
            <TagsInput
                tags={tags}
                tagOptions={tagOptions}
                onClickAdd={(tag) => onChange('addTag', tag)}
                onChange={(tag) => onChange('removeTag', tag)} />

    {/*        TODO - make radio buttons*/}
            <Button
                size='xs'
                onClick={() => onChange('myScenes', false)}
            >'All'</Button>
            <Button
                size='xs'
                onClick={() => onChange('myScenes', true)}
            >'Just Mine'</Button>

        </div>


    )
}

export default ScriptSearch;