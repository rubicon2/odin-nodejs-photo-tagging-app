import Modal from '../Modal';

interface Props {
  isActive: boolean;
  onClose?: () => any;
}

export default function ViewWinModal({ isActive, onClose = () => {} }: Props) {
  return (
    <Modal isActive={isActive} onClose={onClose}>
      You Won!
    </Modal>
  );
}
