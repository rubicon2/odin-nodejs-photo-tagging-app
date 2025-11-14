interface Props {
  photo: Photo;
}

export default function PhotoListItem({ photo }: Props) {
  return <>{photo.altText}</>;
}
