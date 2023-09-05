import {
    useQuery,
} from '@tanstack/react-query';



// Functional component that allows React-Query to be used in class component.
export const Query = (props) => {
    return props.children(useQuery(props.queryKey, props.queryFn, props.queryOptions))
}




//  
export const fetchData = async (url) => { //TODO add ,errorMessage
    const response = await fetch(url);
    if (!response.ok) {
        //TODO const finalErrorMessage = errorMessage ?? 'Network response was not ok';
        throw new Error('Network response was not ok');
    }
    return response.json();
};

