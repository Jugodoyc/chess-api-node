export function getRowAndColumn (index) {
  const column = Math.floor(index / 8)
  const row = index % 8
  return { row, column }
}

export function getIndex ({ row, column }) {
  return column * 8 + row
}
