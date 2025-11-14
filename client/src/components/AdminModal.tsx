import Modal from './Modal';
import EnableAdminForm from './EnableAdminForm';
import DisableAdminForm from './DisableAdminForm';
import { useState } from 'react';

interface Props {
  isActive?: Boolean;
  isAdmin?: Boolean;
  onAdminEnabled?: Function;
  onAdminDisabled?: Function;
  onClose?: Function;
  onMessage?: Function;
}

export default function AdminModal({
  isActive = false,
  isAdmin = false,
  onAdminEnabled = () => {},
  onAdminDisabled = () => {},
  onClose = () => {},
  onMessage = () => {},
}: Props) {
  const [message, setMessage] = useState(null);
  return (
    <Modal
      isActive={isActive}
      onClose={(event) => {
        setMessage(null);
        onClose(event);
      }}
    >
      {isAdmin ? (
        <DisableAdminForm
          onDisable={onAdminDisabled}
          onMessage={(v: any) => {
            setMessage(v);
            onMessage(v);
          }}
        />
      ) : (
        <EnableAdminForm
          onEnable={onAdminEnabled}
          onMessage={(v: any) => {
            setMessage(v);
            onMessage(v);
          }}
        />
      )}
      {message && <>{message}</>}
    </Modal>
  );
}
