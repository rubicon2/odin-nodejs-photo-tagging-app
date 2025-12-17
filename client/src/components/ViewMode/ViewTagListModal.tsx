import Modal from '../Modal';
import { ModalContent, ModalHeaderCentered } from '../../styled/Modal';
import UnstyledList from '../../styled/UnstyledList';
import FakeLink from '../../styled/FakeLink';
import styled from 'styled-components';

const CenteredList = styled(UnstyledList)`
  text-align: center;
`;

const Message = styled.div`
  text-align: center;
`;

interface Props {
  isActive: boolean;
  tags: Array<Required<Tag>>;
  message?: string | null;
  onTagClick: (tagId: React.Key) => any;
  onClose?: () => any;
}

export default function ViewTagListModal({
  isActive,
  tags = [],
  message = null,
  onTagClick = () => {},
  onClose = () => {},
}: Props) {
  return (
    <Modal isActive={isActive} onClose={onClose}>
      <ModalContent>
        <ModalHeaderCentered>Who is it?</ModalHeaderCentered>
        <CenteredList>
          {tags.map((tag) => {
            return (
              <li
                key={tag.id}
                onClick={() => {
                  onTagClick(tag.id);
                }}
              >
                <FakeLink>{tag.name}</FakeLink>
              </li>
            );
          })}
        </CenteredList>
        {message && <Message>{message}</Message>}
      </ModalContent>
    </Modal>
  );
}
