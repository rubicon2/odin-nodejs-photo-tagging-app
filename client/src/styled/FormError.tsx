import styled from 'styled-components';

const FormError = styled.span`
  grid-column: 1 / -1;
  text-align: right;
  color: #dd2222;

  @media (prefers-color-scheme: dark) {
    color: #ff5555;
  }
`;

export default FormError;
