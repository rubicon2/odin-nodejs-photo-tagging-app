// Image filename stored on db but not absolute url.
// Since server domain may change, etc. we don't want that baked into our db entries.
export default function createImgUrl(filename) {
  return `${process.env.VITE_SERVER_URL}/data/${filename}`;
}
