import Modal from './Modal';
import EnableAdminForm from './EnableAdminForm';
import DisableAdminForm from './DisableAdminForm';

interface Props {
  isActive?: Boolean;
  isAdmin?: Boolean;
  onAdminEnabled?: Function;
  onAdminDisabled?: Function;
  onMessage?: Function;
}

export default function AdminModal({
  isActive = false,
  isAdmin = false,
  onAdminEnabled = () => {},
  onAdminDisabled = () => {},
  onMessage = () => {},
}: Props) {
  return (
    <Modal isActive={isActive}>
      {isAdmin ? (
        <DisableAdminForm onDisable={onAdminDisabled} onMessage={onMessage} />
      ) : (
        <EnableAdminForm onEnable={onAdminEnabled} onMessage={onMessage} />
      )}
    </Modal>
  );
}
