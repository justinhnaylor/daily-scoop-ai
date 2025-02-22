export interface TrendingArticle {
  id: string
  title: string
  imageUrl: string | null
  thumbnailUrl: string | null
  useImage: boolean
  views: number
  createdAt: Date
  keywords: string[]
}

export interface Article extends TrendingArticle {
  id: string
  body: string
  audioUrl: string | null
  authorId: string
  categoryId: number | null
  createdAt: Date
  updatedAt: Date
  published: boolean
  urlTitle: string
  category?: {
    name: string
  } | null
  author?: {
    name: string | null
    username: string
    profilePictureUrl: string | null
  }
  defaultImages?: {
    banner: {
      light: string
      dark: string
    }
    thumbnail: {
      light: string
      dark: string
    }
  }
}

export interface Category {
  id: number
  name: string
}

export interface PaginatedArticles {
  articles: Article[]
  totalPages: number
  currentPage: number
}

export interface ProcessedArticle extends Article {
  shareUrl: string
  defaultImages: {
    banner: {
      light: string
      dark: string
    }
    thumbnail: {
      light: string
      dark: string
    }
  }
}
