type Photo = {
  id: React.Key;
  altText: string;
  url: string;
  tagCount: number;
  tags: Array<Tag>;
};

type Tag = {
  readonly id: React.Key;
  readonly name: string;
  readonly posX: number;
  readonly posY: number;
  readonly imageId: string;
};

type EditableTag = {
  id?: React.Key;
  posX: number;
  posY: number;
  name: string;
};

type Pos = {
  x: number;
  y: number;
};
