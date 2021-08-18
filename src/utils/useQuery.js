// A custom hook that builds on useLocation to parse
// the query string for you.
const useQuery = (queryString) => new URLSearchParams(queryString);

export default useQuery;
