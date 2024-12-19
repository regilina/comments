export interface ApiResponse {
  results: Array<{
    name: {
      first: string
      last: string
    }
  }>
}
