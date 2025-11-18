import styled from 'styled-components';

const ImportantButton = styled.button`
  background-color: #4444ff;
  color: rgba(255, 255, 255, 0.87);
  font-weight: bold;

  &:focus-visible {
    outline: 2px solid black;
  }
`;

export default ImportantButton;
