import Modal from '../Modal';
import ImportantButton from '../../styled/ImportantButton';
import styled from 'styled-components';

const ModalHeader = styled.h2`
  text-align: center;
`;

interface Props {
  isActive: boolean;
  onClose?: () => any;
}

export default function ViewWinModal({ isActive, onClose = () => {} }: Props) {
  return (
    <Modal isActive={isActive} onClose={onClose}>
      <ModalHeader>You Won!</ModalHeader>
      <ImportantButton type="submit" onClick={onClose}>
        Get New Image
      </ImportantButton>
    </Modal>
  );
}
