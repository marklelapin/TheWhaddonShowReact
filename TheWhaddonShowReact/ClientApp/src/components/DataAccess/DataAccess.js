import {
    useQuery,
} from '@tanstack/react-query';



// Functional component that allows React-Query to be used in class component.
export const Query = (props) => {
    return props.children(useQuery(props.queryKey, props.queryFn, props.queryOptions))
}




//  
export const fetchData = async (url) => { //TODO add ,errorMessage
    const response = await fetch(url)
        .then(response => response.json())
        .catch((error) => { throw new Error('Server request failed: ' + error) })
    
    return response;
};

//Test code for Query component
/*<pre>{JSON.stringify(data, null, 2)}</pre>*/