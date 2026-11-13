type SearchInputProps = {
  value: string
  onQueryChange: (value: string) => void
}

export function SearchInput(props: SearchInputProps) {
  const { value, onQueryChange } = props

  return (
    <div className="filtro-grupo search-input">
      <label htmlFor="fighter-search">Buscar por nombre o apodo</label>
      <input
        id="fighter-search"
        type="text"
        value={value}
        placeholder="Ej: Pantera"
        onChange={(event) => onQueryChange(event.currentTarget.value)}
      />
    </div>
  )
}