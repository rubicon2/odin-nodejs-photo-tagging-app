// This can be used throughout the client for uniform padding amongst all page elements.
// If a certain side (e.g. the top) needs different padding due to different parts of
// the page doubling up the padding, this can be extended and the offending padding removed.
import styled from 'styled-components';

const PaddedContainer = styled.div`
  padding: 1rem;
`;

export default PaddedContainer;
