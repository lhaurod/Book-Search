import gql from 'graphql-tag';

//getting 
export const GET_ME = gql`
{
    me {
        _id
        username
        email
        bookCount
        savedBooks {
            # _id
            bookId
            authors
            image
            link
            title
            description
        }
    }
}
`;