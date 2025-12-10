import Modal from '../Modal';
import UnstyledList from '../../styled/UnstyledList';
import { ModalContent, ModalHeaderCentered } from '../../styled/Modal';

interface Props {
  isActive: boolean;
  tags: Array<Tag>;
  onTagClick: (tagId: React.Key) => any;
  onClose?: () => any;
}

export default function ViewTagListModal({
  isActive,
  tags = [],
  onTagClick = () => {},
  onClose = () => {},
}: Props) {
  return (
    <Modal isActive={isActive} onClose={onClose}>
      <ModalContent>
        <ModalHeaderCentered>Who is it?</ModalHeaderCentered>
        <UnstyledList>
          {tags.map((tag: Tag) => {
            return (
              <li
                key={tag.id}
                onClick={() => {
                  onTagClick(tag.id);
                }}
              >
                {tag.name}
              </li>
            );
          })}
        </UnstyledList>
      </ModalContent>
    </Modal>
  );
}
