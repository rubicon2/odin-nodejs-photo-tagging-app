import Modal from '../Modal';
import ImportantButton from '../../styled/ImportantButton';
import styled from 'styled-components';

const Content = styled.div`
  display: grid;
  grid-auto-columns: max-content;
  gap: 1rem;
`;

const ModalHeader = styled.h2`
  margin: 0;
  text-align: center;
`;

interface Props {
  isActive: boolean;
  time: number;
  onClose?: () => any;
}

export default function ViewWinModal({
  isActive,
  time,
  onClose = () => {},
}: Props) {
  const time2DP = Math.round(time / 10) / 100;
  return (
    <Modal isActive={isActive} onClose={onClose}>
      <Content>
        <ModalHeader>You Won!</ModalHeader>
        You took {time2DP} seconds.
        <ImportantButton type="submit" onClick={onClose}>
          Get New Image
        </ImportantButton>
      </Content>
    </Modal>
  );
}
