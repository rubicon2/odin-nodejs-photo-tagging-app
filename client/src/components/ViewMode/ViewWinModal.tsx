import Modal from '../Modal';
import ViewWinTimeForm from './ViewWinTimeForm';
import { ModalContent, ModalHeaderCentered } from '../../styled/Modal';
import styled from 'styled-components';

const CenteredDiv = styled.div`
  text-align: center;
`;

interface Props {
  isActive: boolean;
  time: number;
  onButtonClick?: () => any;
  onClose?: () => any;
}

export default function ViewWinModal({
  isActive,
  time,
  onButtonClick = () => {},
  onClose = () => {},
}: Props) {
  const time2DP = Math.round(time / 10) / 100;

  return (
    <Modal isActive={isActive} onClose={onClose}>
      <ModalContent>
        <ModalHeaderCentered>You Won!</ModalHeaderCentered>
        <CenteredDiv>You took {time2DP} seconds.</CenteredDiv>
        <ViewWinTimeForm onFormSubmit={onButtonClick} />
      </ModalContent>
    </Modal>
  );
}
