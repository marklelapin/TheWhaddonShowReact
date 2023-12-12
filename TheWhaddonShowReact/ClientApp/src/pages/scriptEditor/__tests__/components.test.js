import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store'



//components to test
import Comment from '../components/Comment';

//mock data
import {
    mockCurrentScriptItems,
    comment23
} from './mockData';

const mockStore = configureStore([]);

const initialState = {
     scriptEditor: {
            currentScriptItems: mockCurrentScriptItems
        }
}
const store = mockStore(initialState)


xit('COMMENT renders without crashing', () => {

    const div = document.createElement('div');
    ReactDOM.render(
        <Provider store={store}>
            <Comment id={comment23.id} />
        </Provider>
        , div)
});

xit('COMMENT renders without crashing', () => {

    const div = document.createElement('div');
    ReactDOM.render(
        <Provider store={store}>
            <Comment id={comment23.id} />
        </Provider>
        , div)
});