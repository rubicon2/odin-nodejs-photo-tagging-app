import Modal from './Modal';
import EnableAdminForm from './EnableAdminForm';
import DisableAdminForm from './DisableAdminForm';
import { ModalContent, ModalHeader } from '../styled/Modal';

interface Props {
  isActive?: Boolean;
  isAdmin?: Boolean;
  onAdminEnabled?: Function;
  onAdminDisabled?: Function;
  onClose?: Function;
}

export default function AdminModal({
  isActive = false,
  isAdmin = false,
  onAdminEnabled = () => {},
  onAdminDisabled = () => {},
  onClose = () => {},
}: Props) {
  return (
    <Modal
      title="Admin Settings"
      isActive={isActive}
      onClose={(event) => {
        onClose(event);
      }}
    >
      <ModalContent>
        <ModalHeader>Settings</ModalHeader>
        {isAdmin ? (
          <DisableAdminForm onDisable={onAdminDisabled} />
        ) : (
          <EnableAdminForm onEnable={onAdminEnabled} />
        )}
      </ModalContent>
    </Modal>
  );
}
