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

type Time = {
  id?: React.Key;
  imageId?: string;
  name: string;
  timeMs: number;
};

type Pos = {
  x: number;
  y: number;
};

type ServerValidationError = {
  location: string;
  path: string;
  type: string;
  value: string;
  msg: string;
};
