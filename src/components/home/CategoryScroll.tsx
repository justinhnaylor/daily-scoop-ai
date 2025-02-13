interface Category {
  id: number
  name: string
}

export default function CategoryScroll({
  categories,
  selectedCategory,
  onSelect,
}: {
  categories: Category[]
  selectedCategory: number | null
  onSelect: (id: number | null) => void
}) {
  return (
    <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
      <button
        onClick={() => onSelect(null)}
        className={`whitespace-nowrap px-4 py-2 rounded-full ${
          selectedCategory === null
            ? "bg-foreground text-background"
            : "border border-foreground/20"
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`whitespace-nowrap px-4 py-2 rounded-full ${
            selectedCategory === category.id
              ? "bg-foreground text-background"
              : "border border-foreground/20"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
