export function generateId() {
  let array = new Uint32Array(2);
  crypto.getRandomValues(array);
  let id = array[0].toString(36) + array[1].toString(36);
  if (id.length > 8) {
    id = id.slice(0, 8);
  }
  return id;
}
