type Photo = {
  id: React.Key;
  altText: string;
  url: string;
  tagCount: number;
  tags: Array<Tag>;
};

type Tag = {
  id?: React.Key;
  imageId?: string;
  name: string;
  posX: number;
  posY: number;
};

type Pos = {
  x: number;
  y: number;
};
