import {
    useQuery,
    useMutation,
} from '@tanstack/react-query';



// Functional component that allows React-Query useQuery to be used in class component.
export const Query = (props) => {
    return props.children(useQuery(props.queryKey, props.queryFn, props.queryOptions))
}

// Functional component that allows React-Query useMutation to be used in class component.
export const Mutation = (props) => {
    return props.children(useMutation(props.mutationFn, props.mutationOptions))
}

//  
export const fetchData = async (url, options = {}) => { //TODO add ,errorMessage
    const response = await fetch(url)
        .then(response => response.json())
        .catch((error) => { throw new Error('Server request failed: ' + error) })
    
    return response;
};



export const fetchPostFormData = async (url, formData, options = {}) => {

    options.body = formData
    if (!options.method) { options.method = 'POST' };
    if (!options.headers) { options.headers = { 'Content-Type': 'multipart/form-data' } }; 

    const response = await fetch(url, options)
        .then(response => response.json())
        .catch((error) => { throw new Error('Server request failed: ' + error) })

    return response;
}



export const fetchPostData = async (url, data, options = {}) => {

    options.body = JSON.stringify(data);
    if (!options.method) { options.method = 'POST' };
    if (!options.headers) { options.headers = { 'Content-Type': 'application/json' } }; 

const response = await fetch(url, options)
        .then(response => response.json())
        .catch((error) => { throw new Error('Server request failed: ' + error) })

    return response;
}