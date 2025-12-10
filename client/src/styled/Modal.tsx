import styled from 'styled-components';

const ModalContent = styled.div`
  display: grid;
  grid-auto-columns: max-content;
  gap: 1rem;
`;

const ModalHeader = styled.h2`
  margin: 0;
`;

const ModalHeaderCentered = styled(ModalHeader)`
  text-align: center;
`;

export { ModalContent, ModalHeader, ModalHeaderCentered };
