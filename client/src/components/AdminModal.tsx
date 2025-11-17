import Modal from './Modal';
import EnableAdminForm from './EnableAdminForm';
import DisableAdminForm from './DisableAdminForm';
import styled from 'styled-components';

const ModalHeader = styled.h2`
  margin-top: 0;
`;

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
      <ModalHeader>Settings</ModalHeader>
      {isAdmin ? (
        <DisableAdminForm onDisable={onAdminDisabled} />
      ) : (
        <EnableAdminForm onEnable={onAdminEnabled} />
      )}
    </Modal>
  );
}
