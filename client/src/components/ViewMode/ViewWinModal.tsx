import Modal from '../Modal';
import ImportantButton from '../../styled/ImportantButton';
import { ModalContent, ModalHeaderCentered } from '../../styled/Modal';

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
        You took {time2DP} seconds.
        <ImportantButton type="button" onClick={onButtonClick}>
          Get New Image
        </ImportantButton>
      </ModalContent>
    </Modal>
  );
}
